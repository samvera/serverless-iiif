import "aws-sdk-client-mock-jest";
import { mockClient } from "aws-sdk-client-mock";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable, PassThrough } from "stream";
import sharp from "sharp";
import { createPyramidTiff } from "../../src/utils/create-tiled-tiff";
import { s3Stream } from "../../src/resolvers";

jest.mock("sharp", () => jest.fn());
jest.mock("../../src/resolvers", () => ({ s3Stream: jest.fn() }));

const mockSharp = sharp as unknown as jest.Mock;
const mockS3Stream = s3Stream as jest.Mock;

describe("createPyramidTiff", () => {
  let s3Mock: ReturnType<typeof mockClient>;
  let mockTransform: PassThrough & {
    removeAlpha: jest.Mock;
    resize: jest.Mock;
    rotate: jest.Mock;
    tiff: jest.Mock;
  };

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    s3Mock = mockClient(S3Client);
    s3Mock.on(PutObjectCommand).resolves({});

    const mockInputStream = new Readable();
    mockInputStream.push(Buffer.from("fake-tiff-data"));
    mockInputStream.push(null);
    mockS3Stream.mockResolvedValue(mockInputStream);

    const passThrough = new PassThrough();
    mockTransform = Object.assign(passThrough, {
      removeAlpha: jest.fn().mockReturnThis(),
      resize: jest.fn().mockReturnThis(),
      rotate: jest.fn().mockReturnThis(),
      tiff: jest.fn().mockReturnThis(),
    });

    mockSharp
      .mockReturnValueOnce(mockTransform)
      .mockReturnValue({
        metadata: jest
          .fn()
          .mockResolvedValue({ width: 1024, height: 768, pages: 4 }),
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("reads from the correct source S3 location", async () => {
    await createPyramidTiff(
      "s3://source-bucket/path/to/input.tif",
      "s3://dest-bucket/path/to/output.tif",
    );
    expect(mockS3Stream).toHaveBeenCalledWith({
      Bucket: "source-bucket",
      Key: "path/to/input.tif",
    });
  });

  it("uploads to the correct destination with IIIF metadata", async () => {
    await createPyramidTiff(
      "s3://source-bucket/input.tif",
      "s3://dest-bucket/output.tif",
    );
    expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, {
      Bucket: "dest-bucket",
      Key: "output.tif",
      ContentType: "image/tiff",
      Metadata: {
        "iiif-width": "1024",
        "iiif-height": "768",
        "iiif-pages": "4",
        "iiif-tilesize": "256",
      },
    });
  });

  it("configures sharp with pyramid tiff options", async () => {
    await createPyramidTiff(
      "s3://source-bucket/input.tif",
      "s3://dest-bucket/output.tif",
    );
    expect(mockTransform.removeAlpha).toHaveBeenCalled();
    expect(mockTransform.tiff).toHaveBeenCalledWith(
      expect.objectContaining({
        tile: true,
        pyramid: true,
        tileWidth: 256,
        tileHeight: 256,
      }),
    );
  });

  it("returns the destination location on success", async () => {
    const result = await createPyramidTiff(
      "s3://source-bucket/input.tif",
      "s3://dest-bucket/output.tif",
    );
    expect(result).toEqual({ Bucket: "dest-bucket", Key: "output.tif" });
  });

  it("rejects when the source stream cannot be read", async () => {
    mockS3Stream.mockRejectedValue(new Error("S3 stream error"));
    await expect(
      createPyramidTiff(
        "s3://source-bucket/input.tif",
        "s3://dest-bucket/output.tif",
      ),
    ).rejects.toThrow("S3 stream error");
  });

  it("rejects when the S3 upload fails", async () => {
    s3Mock.on(PutObjectCommand).rejects(new Error("Upload failed"));
    await expect(
      createPyramidTiff(
        "s3://source-bucket/input.tif",
        "s3://dest-bucket/output.tif",
      ),
    ).rejects.toThrow("Upload failed");
  });
});
