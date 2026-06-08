import { Processor } from "iiif-processor";
import { defaultStreamLocation, s3Stream } from "../resolvers";
import type { S3BatchEvent, S3BatchResult } from "aws-lambda";
import {
  S3Client,
  S3ServiceException,
  CopyObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { fromIni, fromNodeProviderChain } from "@aws-sdk/credential-providers";
import Sharp from "sharp";

export type SingleInvocationEvent = { imageId: string };
export type SingleInvocationResult = { statusCode: number; body: string };
type S3Location = { Bucket: string; Key: string };

const streamResolver = (location: S3Location) => {
  return async (_) => await s3Stream(location);
};

const getMetadata = async (location: S3Location) => {
  const s3 = new S3Client(s3ClientOpts());
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
  location: S3Location,
  metadata: Record<string, string>,
  ContentType: string,
) => {
  const s3 = new S3Client(s3ClientOpts());
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

const getContentType = async (location: S3Location): Promise<string> => {
  try {
    const streamer = streamResolver(location);
    const stream = await streamer({ id: "image" });
    const reader = Sharp({ limitInputPixels: false, page: 0 });
    stream.pipe(reader);
    const { format } = await reader.metadata();
    return `image/${format}`;
  } catch (err) {
    console.error(`Error determining content type for ${location.Key}:`, err);
    return undefined;
  }
};

const processImage = async (location: {
  Bucket: string;
  Key: string;
}): Promise<{ metadata: Record<string, string> }> => {
  const processor = new Processor(
    `http://example.com/iiif/3/image/info.json`,
    streamResolver(location),
  );

  const metadata = (await getMetadata(location)) || {
    ContentType: "application/octet-stream",
    Metadata: {},
  };

  if (
    metadata.ContentType === "application/octet-stream" ||
    metadata.ContentType === "binary/octet-stream"
  ) {
    metadata.ContentType = await getContentType(location);
  }

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
  const newMetadata = { ...metadata.Metadata, ...iiifMetadata };
  for (const key in newMetadata) {
    if (newMetadata[key] === undefined) {
      delete newMetadata[key];
    }
  }
  await setMetadata(location, newMetadata, metadata.ContentType);
  return {
    metadata: newMetadata,
  };
};

const retriable = (err) => {
  if (err instanceof S3ServiceException) {
    const status = err.$metadata.httpStatusCode;
    if (status === 429 || (status >= 500 && status < 600)) {
      return true;
    }
  }
  return false;
};

const batchHandler = async (event: S3BatchEvent) => {
  const id = event.tasks[0].s3Key;
  const bucket = event.tasks[0].s3BucketArn.split(":").pop();
  if (process.env.sourceBucket !== bucket) {
    const error = `Source bucket mismatch: expected ${process.env.sourceBucket}, got ${bucket}`;
    throw new Error(error);
  }

  const response: S3BatchResult = {
    invocationSchemaVersion: "1.0",
    treatMissingKeysAs: "PermanentFailure",
    invocationId: event.invocationId,
    results: [
      {
        taskId: event.tasks[0].taskId,
        resultCode: "Succeeded",
        resultString: "OK",
      },
    ],
  };

  const location = { Bucket: bucket, Key: id };
  try {
    const result = await processImage(location);
    response.results[0].resultString = JSON.stringify(result.metadata);
    return response;
  } catch (err) {
    console.error(`Error processing ${id}:`, err);
    response.results[0].resultCode = retriable(err)
      ? "TemporaryFailure"
      : "PermanentFailure";
    response.results[0].resultString = err.message || "Error";
    return response;
  }
};

export const handler = async (
  event: S3BatchEvent | SingleInvocationEvent,
): Promise<S3BatchResult | SingleInvocationResult> => {
  if ("tasks" in event) {
    return await batchHandler(event);
  } else if ("imageId" in event) {
    const { imageId } = event;
    const location = defaultStreamLocation(imageId);
    const result = await processImage(location);
    return { statusCode: 200, body: JSON.stringify(result.metadata) };
  } else {
    throw new Error("Invalid event format");
  }
};

const s3ClientOpts = () => {
  const credentials = process.env.AWS_PROFILE
    ? fromIni({ profile: process.env.AWS_PROFILE })
    : fromNodeProviderChain();
  return { credentials, httpOptions: { timeout: 600000 } };
};

/* istanbul ignore next */
if (require.main === module) {
  const CHUNK_SIZE = 10;

  const mainImage = async (imageId: string) => {
    try {
      console.log(`Processing image ${imageId}...`);
      const location = defaultStreamLocation(imageId);
      const result = await processImage(location);
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
