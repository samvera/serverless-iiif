/* eslint-env jest */
export {};
import "aws-sdk-client-mock-jest";
import { mockClient } from "aws-sdk-client-mock";
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
} from "@aws-sdk/client-s3";
import mockEvent from "./__mocks/mockEvent";
import mockStream from "./__mocks/mockStream";
import { IIIFError } from "iiif-processor";
import { resolverFactory } from "../src/resolvers";

describe("resolvers", () => {
  const baseUrl = "https://iiif.example.edu/";
  let s3Mock;

  beforeEach(() => {
    s3Mock = mockClient(S3Client);
    s3Mock.on(GetObjectCommand).resolves({ Body: mockStream });
    s3Mock
      .on(HeadObjectCommand)
      .resolves({ Metadata: {} })
      .on(HeadObjectCommand, { Key: "dimensions.tif" })
      .resolves({ Metadata: { width: "2048", height: "1536" } })
      .on(HeadObjectCommand, { Key: "paged-dimensions.tif" })
      .resolves({ Metadata: { width: "2048", height: "1536", pages: "5" } });
  });

  describe("default resolvers", () => {
    const { streamResolver, dimensionResolver } = resolverFactory(
      mockEvent({ headers: {} }),
      false
    );
    describe("streamResolver", () => {
      it("returns a stream and cleans up", async () => {
        await streamResolver({ id: "id", baseUrl });
        expect(s3Mock).toHaveReceivedCommand(GetObjectCommand);
      });

      describe("resolverTemplate", () => {
        beforeEach(() => {
          process.env.resolverTemplate = "/path/to/%s/%s-pyramid.tiff";
        });

        afterEach(() => {
          delete process.env.resolverTemplate;
        });

        it("uses the resolverTemplate, if present", async () => {
          await streamResolver({ id: "id", baseUrl });
          expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: "test-bucket",
            Key: "/path/to/id/id-pyramid.tiff",
          });
        });

        it("supports templates without placeholders", async () => {
          process.env.resolverTemplate = "static-name.tif";
          await streamResolver({ id: "ignored", baseUrl });
          expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: "test-bucket",
            Key: "static-name.tif",
          });
        });
      });
    });

    describe("dimensionResolver", () => {
      it("has metadata dimensions", async () => {
        const expected = [{ width: 2048, height: 1536 }];
        const result = await dimensionResolver({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("calculates pyramid info if metadata has pages", async () => {
        const expected = [
          { width: 2048, height: 1536 },
          { width: 1024, height: 768 },
          { width: 512, height: 384 },
          { width: 256, height: 192 },
          { width: 128, height: 96 },
        ];
        const result = await dimensionResolver({
          id: "paged-dimensions",
          baseUrl: "https://iiif.example.edu/",
        });
        expect(s3Mock).toHaveReceivedCommandWith(HeadObjectCommand, {
          Bucket: "test-bucket",
          Key: "paged-dimensions.tif",
        });
        expect(result).toEqual(expected);
      });

      it("does not have metadata dimensions", async () => {
        const expected = null;
        const result = await dimensionResolver({
          id: "no-dimensions",
          baseUrl,
        });
        expect(result).toEqual(expected);
      });
    });
  });

  describe("preflight resolvers", () => {
    let savedEnvironment;

    beforeEach(() => {
      savedEnvironment = { ...process.env };
    });

    afterEach(() => {
      process.env = { ...savedEnvironment };
    });

    describe("streamResolver", () => {
      const { streamResolver } = resolverFactory(
        mockEvent({
          headers: {
            "x-preflight-location": "s3://test-bucket/dimensions.tif",
          },
        }),
        true
      );
      it("returns a stream and cleans up", async () => {
        await streamResolver({ id: "id", baseUrl });
      });

      it("falls back to default location for non-s3 preflight URI", async () => {
        const { streamResolver: sr } = resolverFactory(
          mockEvent({
            headers: { "x-preflight-location": "https://example.com/file.tif" },
          }),
          true
        );
        await sr({ id: "dimensions", baseUrl });
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
          Bucket: "test-bucket",
          Key: "dimensions.tif",
        });
      });
    });

    describe("dimensionResolver", () => {
      it("preflight dimensions (case insensitive)", async () => {
        const { dimensionResolver } = resolverFactory(
          mockEvent({
            headers: {
              "X-Preflight-Dimensions": '{ "width": 640, "height": 480 }',
            },
          }),
          true
        );
        const expected = { width: 640, height: 480 };
        const result = await dimensionResolver({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("preflight dimensions (single)", async () => {
        const { dimensionResolver } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-dimensions": '{ "width": 640, "height": 480 }',
            },
          }),
          true
        );
        const expected = { width: 640, height: 480 };
        const result = await dimensionResolver({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("preflight dimensions (array)", async () => {
        const { dimensionResolver } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-dimensions": '[{ "width": 640, "height": 480 }]',
            },
          }),
          true
        );
        const expected = [{ width: 640, height: 480 }];
        const result = await dimensionResolver({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("preflight dimensions (pages)", async () => {
        const { dimensionResolver } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-dimensions":
                '{ "width": 640, "height": 480, "pages": 2 }',
            },
          }),
          true
        );
        const expected = [
          { width: 640, height: 480 },
          { width: 320, height: 240 },
        ];
        const result = await dimensionResolver({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("preflight dimensions (limit)", async () => {
        const { dimensionResolver } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-dimensions":
                '{ "width": 640, "height": 480, "limit": 200 }',
            },
          }),
          true
        );
        const expected = [
          { width: 640, height: 480 },
          { width: 320, height: 240 },
          { width: 160, height: 120 },
        ];
        const result = await dimensionResolver({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("no preflight dimensions / metadata dimensions", async () => {
        const { dimensionResolver } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-location": "s3://test-bucket/dimensions.tif",
            },
          }),
          true
        );
        const expected = [{ width: 2048, height: 1536 }];
        const result = await dimensionResolver({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("no preflight dimensions / metadata dimensions / page size limit", async () => {
        process.env.pyramidLimit = "256";
        const { dimensionResolver } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-location": "s3://test-bucket/dimensions.tif",
            },
          }),
          true
        );
        const expected = [
          { width: 2048, height: 1536 },
          { width: 1024, height: 768 },
          { width: 512, height: 384 },
          { width: 256, height: 192 },
        ];
        const result = await dimensionResolver({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("no preflight dimensions / no metadata dimensions", async () => {
        const { dimensionResolver } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-location": "s3://test-bucket/no-dimensions.tif",
            },
          }),
          true
        );
        const expected = null;
        const result = await dimensionResolver({
          id: "no-dimensions",
          baseUrl,
        });
        expect(result).toEqual(expected);
      });
    });
  });
});

describe("s3 errors", () => {
  const baseUrl = "https://iiif.example.edu/";
  let s3Mock;

  beforeEach(() => {
    const notFoundError = new NotFound({
      $metadata: { httpStatusCode: 404 },
      message: "Not Found",
    });
    s3Mock = mockClient(S3Client);
    s3Mock.on(GetObjectCommand).rejectsOnce(notFoundError);
    s3Mock.on(HeadObjectCommand).rejectsOnce(notFoundError);
  });

  it("streamResolver handles S3 errors gracefully", async () => {
    const { streamResolver } = resolverFactory(
      mockEvent({ headers: {} }),
      false
    );
    expect(streamResolver({ id: "error-dimensions", baseUrl })).rejects.toThrow(
      IIIFError
    );
  });

  it("dimensionResolver handles S3 errors gracefully", async () => {
    const { dimensionResolver } = resolverFactory(
      mockEvent({ headers: {} }),
      false
    );
    expect(
      dimensionResolver({ id: "error-dimensions", baseUrl })
    ).rejects.toThrow(IIIFError);
  });
});
