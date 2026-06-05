import "aws-sdk-client-mock-jest";
import { mockClient } from "aws-sdk-client-mock";
import {
  S3Client,
  HeadObjectCommand,
  CopyObjectCommand,
  NotFound,
} from "@aws-sdk/client-s3";
import { Processor } from "iiif-processor";
import { handler } from "../../src/utils/create-metadata";
import { s3Stream, defaultStreamLocation } from "../../src/resolvers";
import type {
  SingleInvocationEvent,
  SingleInvocationResult,
} from "../../src/utils/create-metadata";
import type { S3BatchEvent, S3BatchResult } from "aws-lambda";

jest.mock("iiif-processor", () => ({ Processor: jest.fn() }));
jest.mock("../../src/resolvers", () => ({
  defaultStreamLocation: jest.fn((id: string) => ({
    Bucket: "test-bucket",
    Key: `${id}.tif`,
  })),
  s3Stream: jest.fn(),
}));

const MockProcessor = Processor as jest.MockedClass<typeof Processor>;

const invokeSingleEvent = async (imageId: string) => {
  const event: SingleInvocationEvent = { imageId };
  const result = (await handler(event)) as SingleInvocationResult;
  return JSON.parse(result.body);
};

const invokeBatchEvent = async (imageId: string) => {
  const event: S3BatchEvent = {
    invocationSchemaVersion: "1",
    invocationId: "a8ed5af9-f1d3-4bb4-ab5c-d21615cf91a8",
    job: {
      id: "640f869a-ce54-4aa5-8de1-a11890fcaf89",
    },
    tasks: [
      {
        taskId: "4b8a01a4-f84c-4dd7-aa91-a0f6d66414a9",
        s3Key: `${imageId}.tif`,
        s3VersionId: "1",
        s3BucketArn: "arn:aws:s3:::test-bucket",
      },
    ],
  };
  const result = (await handler(event)) as S3BatchResult;
  return JSON.parse(result.results[0].resultString);
};

describe.each([
  ["single invocation", invokeSingleEvent],
  ["batch invocation", invokeBatchEvent],
])("create-metadata function (%s)", (label, invoke) => {
  let s3Mock: ReturnType<typeof mockClient>;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    s3Mock = mockClient(S3Client);
    s3Mock.on(HeadObjectCommand).resolves({
      ContentType: "image/tiff",
      Metadata: { "custom-key": "custom-value" },
    });
    s3Mock.on(CopyObjectCommand).resolves({});

    MockProcessor.mockImplementation(
      () =>
        ({
          geometry: jest.fn().mockResolvedValue({
            width: 1024,
            height: 768,
            pages: 3,
            tileWidth: 256,
            tileHeight: 256,
          }),
        }) as unknown as Processor,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns status 200 with imageId and merged metadata", async () => {
    const result = await invoke("test-image");
    expect(result).toMatchObject({
      "iiif-width": "1024",
      "iiif-height": "768",
      "iiif-pages": "3",
      "iiif-tilesize": "256",
      "custom-key": "custom-value",
    });
  });

  it("sends CopyObjectCommand with merged metadata", async () => {
    await invoke("test-image");
    expect(s3Mock).toHaveReceivedCommandWith(CopyObjectCommand, {
      Bucket: "test-bucket",
      ContentType: "image/tiff",
      Key: "test-image.tif",
      MetadataDirective: "REPLACE",
      Metadata: expect.objectContaining({
        "iiif-width": "1024",
        "iiif-height": "768",
        "custom-key": "custom-value",
      }),
    });
  });

  it("uses iiif-tilesize for square tiles", async () => {
    const result = await invoke("test-image");
    expect(result["iiif-tilesize"]).toBe("256");
    expect(result["iiif-tilewidth"]).toBeUndefined();
    expect(result["iiif-tileheight"]).toBeUndefined();
  });

  it("uses iiif-tilewidth and iiif-tileheight for non-square tiles", async () => {
    MockProcessor.mockImplementation(
      () =>
        ({
          geometry: jest.fn().mockResolvedValue({
            width: 1024,
            height: 768,
            pages: 3,
            tileWidth: 512,
            tileHeight: 256,
          }),
        }) as unknown as Processor,
    );
    const result = await invoke("test-image");
    expect(result["iiif-tilewidth"]).toBe("512");
    expect(result["iiif-tileheight"]).toBe("256");
    expect(result["iiif-tilesize"]).toBeUndefined();
  });

  it("omits undefined geometry values from metadata", async () => {
    MockProcessor.mockImplementation(
      () =>
        ({
          geometry: jest.fn().mockResolvedValue({
            width: 1024,
            height: 768,
            // pages intentionally omitted
            tileWidth: 256,
            tileHeight: 256,
          }),
        }) as unknown as Processor,
    );
    const result = await invoke("test-image");
    expect(result["iiif-pages"]).toBeUndefined();
  });

  it("handles a missing S3 object (404) by writing only geometry metadata", async () => {
    s3Mock.reset();
    s3Mock.on(HeadObjectCommand).rejects(
      new NotFound({
        $metadata: { httpStatusCode: 404 },
        message: "Not Found",
      }),
    );
    s3Mock.on(CopyObjectCommand).resolves({});

    const result = await invoke("new-image");
    expect(result["iiif-width"]).toBe("1024");
    expect(result["custom-key"]).toBeUndefined();
  });

  it("re-throws non-404 S3 errors from HeadObjectCommand", async () => {
    s3Mock.reset();
    s3Mock.on(HeadObjectCommand).rejects(new Error("network error"));
    await expect(invoke("test-image")).rejects.toThrow("network error");
  });
});
