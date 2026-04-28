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

jest.mock("iiif-processor", () => ({ Processor: jest.fn() }));
jest.mock("../../src/resolvers", () => ({
  defaultStreamLocation: jest.fn((id: string) => ({
    Bucket: "test-bucket",
    Key: `${id}.tif`,
  })),
  s3Stream: jest.fn(),
}));

const MockProcessor = Processor as jest.MockedClass<typeof Processor>;
const mockS3Stream = s3Stream as jest.Mock;
const mockDefaultStreamLocation = defaultStreamLocation as jest.Mock;

describe("create-metadata handler", () => {
  let s3Mock: ReturnType<typeof mockClient>;

  beforeEach(() => {
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
    const result = await handler({ imageId: "test-image" });
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.imageId).toBe("test-image");
    expect(body.metadata).toMatchObject({
      "iiif-width": "1024",
      "iiif-height": "768",
      "iiif-pages": "3",
      "iiif-tilesize": "256",
      "custom-key": "custom-value",
    });
  });

  it("sends CopyObjectCommand with merged metadata", async () => {
    await handler({ imageId: "test-image" });
    expect(s3Mock).toHaveReceivedCommandWith(CopyObjectCommand, {
      Bucket: "test-bucket",
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
    const result = await handler({ imageId: "test-image" });
    const body = JSON.parse(result.body);
    expect(body.metadata["iiif-tilesize"]).toBe("256");
    expect(body.metadata["iiif-tilewidth"]).toBeUndefined();
    expect(body.metadata["iiif-tileheight"]).toBeUndefined();
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
    const result = await handler({ imageId: "test-image" });
    const body = JSON.parse(result.body);
    expect(body.metadata["iiif-tilewidth"]).toBe("512");
    expect(body.metadata["iiif-tileheight"]).toBe("256");
    expect(body.metadata["iiif-tilesize"]).toBeUndefined();
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
    const result = await handler({ imageId: "test-image" });
    const body = JSON.parse(result.body);
    expect(body.metadata["iiif-pages"]).toBeUndefined();
  });

  it("handles a missing S3 object (404) by writing only geometry metadata", async () => {
    s3Mock.reset();
    s3Mock
      .on(HeadObjectCommand)
      .rejects(
        new NotFound({ $metadata: { httpStatusCode: 404 }, message: "Not Found" }),
      );
    s3Mock.on(CopyObjectCommand).resolves({});

    const result = await handler({ imageId: "new-image" });
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.imageId).toBe("new-image");
    expect(body.metadata["iiif-width"]).toBe("1024");
    expect(body.metadata["custom-key"]).toBeUndefined();
  });

  it("re-throws non-404 S3 errors from HeadObjectCommand", async () => {
    s3Mock.reset();
    s3Mock.on(HeadObjectCommand).rejects(new Error("network error"));
    await expect(handler({ imageId: "test-image" })).rejects.toThrow(
      "network error",
    );
  });

  it("passes a stream resolver that calls s3Stream with the default location", async () => {
    let capturedResolver: ((args: { id: string }) => Promise<unknown>) | undefined;
    MockProcessor.mockImplementation((_, resolver) => {
      capturedResolver = resolver as typeof capturedResolver;
      return {
        geometry: jest.fn().mockResolvedValue({
          width: 1024,
          height: 768,
          pages: 3,
          tileWidth: 256,
          tileHeight: 256,
        }),
      } as unknown as Processor;
    });

    await handler({ imageId: "test-image" });

    await capturedResolver!({ id: "stream-test" });
    expect(mockDefaultStreamLocation).toHaveBeenCalledWith("stream-test");
    expect(mockS3Stream).toHaveBeenCalledWith({
      Bucket: "test-bucket",
      Key: "stream-test.tif",
    });
  });
});
