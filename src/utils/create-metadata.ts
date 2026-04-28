import { Processor } from "iiif-processor";
import { defaultStreamLocation, s3Stream } from "../resolvers";
import {
  S3Client,
  S3ServiceException,
  CopyObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const streamResolver = async ({ id }) => {
  const location = defaultStreamLocation(id);
  return await s3Stream(location);
};

const getMetadata = async (id: string) => {
  const location = defaultStreamLocation(id);
  const s3 = new S3Client({});
  const cmd = new HeadObjectCommand(location);
  try {
    const { ContentType, Metadata } = await s3.send(cmd);
    return { ContentType, Metadata };
  } catch (err) {
    if (
      err instanceof S3ServiceException &&
      err.$metadata.httpStatusCode === 404
    ) {
      return undefined; // Object not found, return undefined metadata
    }
    throw err; // Rethrow other errors
  }
};

const setMetadata = async (
  id: string,
  metadata: Record<string, string>,
  ContentType: string,
) => {
  const location = defaultStreamLocation(id);
  const s3 = new S3Client({});
  const copyCmd = new CopyObjectCommand({
    Bucket: location.Bucket,
    CopySource: `${location.Bucket}/${location.Key}`,
    Key: location.Key,
    Metadata: metadata,
    MetadataDirective: "REPLACE",
    ContentType: ContentType,
  });
  await s3.send(copyCmd);
};

const stringify = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
};

const processImage = async (
  imageId: string,
): Promise<{ imageId: string; metadata: Record<string, string> }> => {
  const processor = new Processor(
    `http://example.com/iiif/3/${imageId}/info.json`,
    streamResolver,
  );
  const { ContentType, Metadata: existingMetadata } =
    (await getMetadata(imageId)) || {};
  const geometry = await processor.geometry(true);

  const tileMetadata =
    geometry.tileWidth == geometry.tileHeight
      ? { "iiif-tilesize": stringify(geometry.tileWidth) }
      : {
          "iiif-tilewidth": stringify(geometry.tileWidth),
          "iiif-tileheight": stringify(geometry.tileHeight),
        };
  const iiifMetadata = {
    "iiif-width": stringify(geometry.width),
    "iiif-height": stringify(geometry.height),
    "iiif-pages": stringify(geometry.pages),
    ...tileMetadata,
  };
  const newMetadata = { ...existingMetadata, ...iiifMetadata };
  for (const key in newMetadata) {
    if (newMetadata[key] === undefined) {
      delete newMetadata[key];
    }
  }
  await setMetadata(imageId, newMetadata, ContentType);
  return {
    imageId,
    metadata: newMetadata,
  };
};

export const handler = async (event: { imageId: string }) => {
  const { imageId } = event;
  const result = await processImage(imageId);
  return { statusCode: 200, body: JSON.stringify(result) };
};

/* istanbul ignore next */
if (require.main === module) {
  const CHUNK_SIZE = 10;

  const mainImage = async (imageId: string) => {
    try {
      console.log(`Processing image ${imageId}...`);
      const result = await processImage(imageId);
      console.log(
        `Metadata created successfully for ${imageId}:`,
        result.metadata,
      );
    } catch (err) {
      console.error(`Error creating metadata for ${imageId}:`, err);
    }
  };

  const main = async (imageIds: string[]) => {
    const chunks = Array.from(
      { length: Math.ceil(imageIds.length / CHUNK_SIZE) },
      (_, i) => imageIds.slice(i * CHUNK_SIZE, i * CHUNK_SIZE + CHUNK_SIZE),
    );
    for (const chunk of chunks) {
      await Promise.all(chunk.map(mainImage));
    }
  };

  const imageIds = process.argv.slice(2);
  if (imageIds.length === 0) {
    console.error("Usage: npm run create-metadata <imageId> [<imageId> ...]");
    process.exit(1);
  }

  main(imageIds).catch((err) => {
    console.error("Error processing images:", err);
    process.exit(1);
  });
}
