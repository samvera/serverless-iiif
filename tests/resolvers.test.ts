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
    const basicMetadata = { width: "2048", height: "1536", pages: "5" };
    s3Mock = mockClient(S3Client);
    s3Mock.on(GetObjectCommand).resolves({ Body: mockStream });
    s3Mock
      .on(HeadObjectCommand)
      .resolves({ Metadata: {} })
      .on(HeadObjectCommand, { Key: "dimensions.tif" })
      .resolves({ Metadata: basicMetadata })
      .on(HeadObjectCommand, { Key: "paged-dimensions.tif" })
      .resolves({ Metadata: basicMetadata })
      .on(HeadObjectCommand, { Key: "prefixed-dimensions.tif" })
      .resolves({
        Metadata: {
          "iiif-width": "2048",
          "iiif-height": "1536",
          "iiif-pages": "5",
        },
      })
      .on(HeadObjectCommand, { Key: "dimensions-with-tileinfo.tif" })
      .resolves({
        Metadata: {
          ...basicMetadata,
          tilewidth: "256",
          tileheight: "256",
        },
      })
      .on(HeadObjectCommand, { Key: "dimensions-with-tilesize.tif" })
      .resolves({
        Metadata: {
          ...basicMetadata,
          tilesize: "256",
        },
      });
  });

  describe("default resolvers", () => {
    const { streamResolver, geometryFunction } = resolverFactory(
      mockEvent({ headers: {} }),
      false,
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

    describe("geometryFunction", () => {
      it("calculates pyramid info if metadata has pages", async () => {
        const expected = {
          width: 2048,
          height: 1536,
          pages: 5,
        };
        let result = await geometryFunction({
          id: "paged-dimensions",
          baseUrl: "https://iiif.example.edu/",
        });
        expect(s3Mock).toHaveReceivedCommandWith(HeadObjectCommand, {
          Bucket: "test-bucket",
          Key: "paged-dimensions.tif",
        });
        expect(result).toEqual(expected);

        result = await geometryFunction({
          id: "prefixed-dimensions",
          baseUrl: "https://iiif.example.edu/",
        });
        expect(s3Mock).toHaveReceivedCommandWith(HeadObjectCommand, {
          Bucket: "test-bucket",
          Key: "prefixed-dimensions.tif",
        });
        expect(result).toEqual(expected);
      });

      it("honors the tile size metadata", async () => {
        const expected = {
          width: 2048,
          height: 1536,
          pages: 5,
          tileWidth: 256,
          tileHeight: 256,
        };
        let result = await geometryFunction({
          id: "dimensions-with-tileinfo",
          baseUrl: "https://iiif.example.edu/",
        });
        expect(result).toEqual(expected);

        result = await geometryFunction({
          id: "dimensions-with-tilesize",
          baseUrl: "https://iiif.example.edu/",
        });
        expect(result).toEqual(expected);
      });

      it("does not have metadata dimensions", async () => {
        const expected = {};
        const result = await geometryFunction({
          id: "no-dimensions",
          baseUrl,
        });
        expect(result).toEqual(expected);
      });
    });

    describe("c2paConfigResolver", () => {
      let savedEnvironment;

      beforeEach(() => {
        savedEnvironment = { ...process.env };
      });

      afterEach(() => {
        process.env = { ...savedEnvironment };
      });

      it("returns null if C2PA environment variables are missing", async () => {
        const { c2paConfigResolver } = resolverFactory(
          mockEvent({ headers: {} }),
          true,
        );
        const result = await c2paConfigResolver({ id: "id" });
        expect(result).toBeNull();
      });

      it("returns C2PA configuration if environment variables are set", async () => {
        const { c2paConfigResolver } = resolverFactory(
          mockEvent({ headers: {} }),
          true,
        );

        process.env.C2PA_CERTIFICATE = "---FAKE CERTIFICATE---";
        process.env.C2PA_KEY = "---FAKE KEY---";
        process.env.C2PA_SOFTWARE_AGENT = "Test Agent";
        process.env.C2PA_TSA_URL = "https://fake-tsa-url.com";
        const result = await c2paConfigResolver({ id: "id" });
        const expected = {
          certificate: "---FAKE CERTIFICATE---",
          key: "---FAKE KEY---",
          softwareAgent: "Test Agent",
          tsaUrl: "https://fake-tsa-url.com",
        };
        expect(result).not.toBeNull();
        for (const key in expected) {
          expect(result[key]).toBe(expected[key]);
        }
      });

      it("returns null if any required C2PA environment variable is missing", async () => {
        const { c2paConfigResolver } = resolverFactory(
          mockEvent({ headers: {} }),
          true,
        );

        process.env.C2PA_CERTIFICATE = "---FAKE CERTIFICATE---";
        process.env.C2PA_KEY = "---FAKE KEY---";
        delete process.env.C2PA_SOFTWARE_AGENT;
        let result = await c2paConfigResolver({ id: "id" });
        expect(result).toBeNull();

        delete process.env.C2PA_CERTIFICATE;
        process.env.C2PA_KEY = "---FAKE KEY---";
        process.env.C2PA_SOFTWARE_AGENT = "Test Agent";
        result = await c2paConfigResolver({ id: "id" });
        expect(result).toBeNull();

        process.env.C2PA_CERTIFICATE = "---FAKE CERTIFICATE---";
        delete process.env.C2PA_KEY;
        process.env.C2PA_SOFTWARE_AGENT = "Test Agent";
        result = await c2paConfigResolver({ id: "id" });
        expect(result).toBeNull();
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
        true,
      );
      it("returns a stream and cleans up", async () => {
        await streamResolver({ id: "id", baseUrl });
      });

      it("falls back to default location for non-s3 preflight URI", async () => {
        const { streamResolver: sr } = resolverFactory(
          mockEvent({
            headers: { "x-preflight-location": "https://example.com/file.tif" },
          }),
          true,
        );
        await sr({ id: "dimensions", baseUrl });
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
          Bucket: "test-bucket",
          Key: "dimensions.tif",
        });
      });
    });

    describe("geometryFunction", () => {
      it("preflight dimensions (case insensitive)", async () => {
        const { geometryFunction } = resolverFactory(
          mockEvent({
            headers: {
              "X-Preflight-Dimensions": '{ "width": 640, "height": 480 }',
            },
          }),
          true,
        );
        const expected = { width: 640, height: 480 };
        const result = await geometryFunction({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("preflight dimensions (single)", async () => {
        const { geometryFunction } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-dimensions": '{ "width": 640, "height": 480 }',
            },
          }),
          true,
        );
        const expected = { width: 640, height: 480 };
        const result = await geometryFunction({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("preflight dimensions (array)", async () => {
        const { geometryFunction } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-dimensions": '[{ "width": 640, "height": 480 }]',
            },
          }),
          true,
        );
        const expected = {
          width: 640,
          height: 480,
          sizes: [{ width: 640, height: 480 }],
          pages: 1,
        };
        const result = await geometryFunction({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("preflight dimensions (pages)", async () => {
        const { geometryFunction } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-dimensions":
                '{ "width": 640, "height": 480, "pages": 2 }',
            },
          }),
          true,
        );
        const expected = {
          width: 640,
          height: 480,
          pages: 2,
        };
        const result = await geometryFunction({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("preflight dimensions (limit)", async () => {
        const { geometryFunction } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-dimensions":
                '{ "width": 640, "height": 480, "limit": 200 }',
            },
          }),
          true,
        );
        const expected = {
          width: 640,
          height: 480,
          pages: 2,
        };
        const result = await geometryFunction({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("no preflight dimensions / metadata dimensions", async () => {
        const { geometryFunction } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-location": "s3://test-bucket/dimensions.tif",
            },
          }),
          true,
        );
        const expected = { width: 2048, height: 1536, pages: 5 };
        const result = await geometryFunction({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("no preflight dimensions / metadata dimensions / page size limit", async () => {
        process.env.pyramidLimit = "256";
        const { geometryFunction } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-location": "s3://test-bucket/dimensions.tif",
            },
          }),
          true,
        );
        const expected = { width: 2048, height: 1536, pages: 5 };
        const result = await geometryFunction({ id: "dimensions", baseUrl });
        expect(result).toEqual(expected);
      });

      it("no preflight dimensions / no metadata dimensions", async () => {
        const { geometryFunction } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-location": "s3://test-bucket/no-dimensions.tif",
            },
          }),
          true,
        );
        const expected = {};
        const result = await geometryFunction({
          id: "no-dimensions",
          baseUrl,
        });
        expect(result).toEqual(expected);
      });
    });

    describe("c2paConfigResolver", () => {
      beforeEach(() => {
        process.env.C2PA_CERTIFICATE = "---FAKE CERTIFICATE---";
        process.env.C2PA_KEY = "---FAKE KEY---";
        process.env.C2PA_SOFTWARE_AGENT = "Test Agent";
        process.env.C2PA_TSA_URL = "https://fake-tsa-url.com";
      });

      it("returns correct configuration based on C2PA headers", async () => {
        const { c2paConfigResolver } = resolverFactory(
          mockEvent({
            headers: {
              "x-preflight-c2pa-certificate":
                "---FAKE CERTIFICATE FROM HEADER---",
              "x-preflight-c2pa-key": "---FAKE KEY FROM HEADER---",
              "x-preflight-c2pa-software-agent": "Test Agent From Header",
              "x-preflight-c2pa-tsa-url": "https://fake-tsa-url.com",
            },
          }),
          true,
        );
        const expected = {
          certificate: "---FAKE CERTIFICATE FROM HEADER---",
          key: "---FAKE KEY FROM HEADER---",
          softwareAgent: "Test Agent From Header",
          tsaUrl: "https://fake-tsa-url.com",
        };
        const result = await c2paConfigResolver({ id: "id" });
        for (const key in expected) {
          expect(result[key]).toEqual(expected[key]);
        }
      });

      it("falls back to environment variable config if headers are missing", async () => {
        const { c2paConfigResolver } = resolverFactory(
          mockEvent({
            headers: {},
          }),
          true,
        );
        const expected = {
          certificate: "---FAKE CERTIFICATE---",
          key: "---FAKE KEY---",
          softwareAgent: "Test Agent",
          tsaUrl: "https://fake-tsa-url.com",
        };
        const result = await c2paConfigResolver({ id: "id" });
        for (const key in expected) {
          expect(result[key]).toEqual(expected[key]);
        }
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
      false,
    );
    expect(streamResolver({ id: "error-dimensions", baseUrl })).rejects.toThrow(
      IIIFError,
    );
  });

  it("geometryFunction handles S3 errors gracefully", async () => {
    const { geometryFunction } = resolverFactory(
      mockEvent({ headers: {} }),
      false,
    );
    expect(
      geometryFunction({ id: "error-dimensions", baseUrl }),
    ).rejects.toThrow(IIIFError);
  });
});
