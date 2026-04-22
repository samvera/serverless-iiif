import {
  StreamResolver,
  GeometryFunction,
  IIIFError,
  ImageGeometry,
} from "iiif-processor";
import {
  S3Client,
  S3ServiceException,
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { LambdaEvent } from "./contracts";
import createDebug from "debug";
import { getHeaderValue, inspect } from "./helpers";
import * as URI from "uri-js";
import * as util from "util";

const debug = createDebug("serverless-iiif:resolvers");

export interface Resolvers {
  streamResolver: StreamResolver;
  geometryFunction: GeometryFunction;
}

// IIIF RESOLVERS

// Create input stream from S3 location
const s3Stream = async (location: {
  Bucket: string;
  Key: string;
}): Promise<NodeJS.ReadableStream> => {
  const s3 = new S3Client({});
  const cmd = new GetObjectCommand(location);
  try {
    const s3Response = await s3.send(cmd);
    return s3Response.Body as NodeJS.ReadableStream;
  } catch (err) {
    throw iiifErrorFromS3Error(err, location);
  }
};

// Compute default stream location from ID
const defaultStreamLocation = (id: string) => {
  const sourceBucket = process.env.tiffBucket as string;
  const resolverTemplate = process.env.resolverTemplate || "%s.tif";
  const replacementCount = (resolverTemplate.match(/%.*?s/g) || []).length;
  const args = new Array(replacementCount).fill(id);
  const key = util.format(resolverTemplate, ...args);
  const result = { Bucket: sourceBucket, Key: key };
  debug(`Resolved default stream location for ID ${id}: ${inspect(result)}`);
  return result;
};

const readNumberFromMetadata = (
  metadata: Record<string, string> | undefined,
  key: string,
) => {
  if (!metadata) return undefined;
  const value = metadata[key] || metadata[`iiif-${key}`];
  if (value) {
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }
  }
  return undefined;
};

const tileSizeDefaults = () => {
  if (process.env.tileWidth && process.env.tileHeight) {
    return {
      tileWidth: Number(process.env.tileWidth),
      tileHeight: Number(process.env.tileHeight),
    };
  }
  if (process.env.tileSize) {
    const size = Number(process.env.tileSize);
    return { tileWidth: size, tileHeight: size };
  }
  return {};
};

// Retrieve dimensions from S3 metadata
const geometryRetriever = async (location: {
  Bucket: string;
  Key: string;
}): Promise<ImageGeometry> => {
  const s3 = new S3Client({});
  const cmd = new HeadObjectCommand(location);
  try {
    const response: HeadObjectCommandOutput = await s3.send(cmd);
    const { Metadata } = response;
    return {
      ...tileSizeDefaults(),
      width: readNumberFromMetadata(Metadata, "width"),
      height: readNumberFromMetadata(Metadata, "height"),
      pages: readNumberFromMetadata(Metadata, "pages"),
      tileWidth:
        readNumberFromMetadata(Metadata, "tilewidth") ||
        readNumberFromMetadata(Metadata, "tilesize"),
      tileHeight:
        readNumberFromMetadata(Metadata, "tileheight") ||
        readNumberFromMetadata(Metadata, "tilesize"),
    };
  } catch (err) {
    throw iiifErrorFromS3Error(err, location);
  }
};

const iiifErrorFromS3Error = (
  err: S3ServiceException,
  location: { Bucket: string; Key: string },
) => {
  const message = `Error fetching S3 object metadata at ${util.inspect(
    location,
  )}: ${err}`;
  const extra = { statusCode: err.$metadata.httpStatusCode };
  return new IIIFError(message, extra);
};

// Preflight resolvers
const parseLocationHeader = (event: LambdaEvent) => {
  const locationHeader = getHeaderValue(event, "x-preflight-location");
  if (locationHeader && locationHeader.match(/^s3:\/\//)) {
    debug(`Preflight location header found: ${locationHeader}`);
    const parsedURI = URI.parse(locationHeader);
    const result = {
      Bucket: parsedURI.host as string,
      Key: (parsedURI.path || "").slice(1),
    };
    debug(`Parsed preflight location: ${inspect(result)}`);
    return result;
  }
  debug("No preflight location header found");
  return null;
};

const parseDimensionsHeader = (event: LambdaEvent): ImageGeometry | null => {
  const dimensionsHeader = getHeaderValue(event, "x-preflight-dimensions");
  if (!dimensionsHeader) {
    debug("No preflight dimensions header found");
    return null;
  }

  debug(`Preflight dimension header found: ${dimensionsHeader}`);
  const result = JSON.parse(dimensionsHeader);
  if (Array.isArray(result) && result.length > 0) {
    return {
      width: result[0].width,
      height: result[0].height,
      sizes: result,
      pages: result.length,
    };
  }
  if (result.sizes) return result;
  if (result.width && result.height) {
    if (result.pages) return result;
    if (result.limit || process.env.pyramidLimit) {
      const limit = Number(result.limit || process.env.pyramidLimit);
      const pages = Math.ceil(
        Math.log2(Math.max(result.width, result.height) / limit),
      );
      return { ...result, pages, limit: undefined };
    }
  }
  return result;
};

const preflightResolver = (event: LambdaEvent): Resolvers => {
  const preflightLocation = parseLocationHeader(event);
  const preflightDimensions = parseDimensionsHeader(event);

  return {
    streamResolver: async ({ id }: { id: string }) => {
      const location = preflightLocation || defaultStreamLocation(id);
      return s3Stream(location);
    },
    geometryFunction: async ({
      id,
    }: {
      id: string;
    }): Promise<ImageGeometry> => {
      const location = preflightLocation || defaultStreamLocation(id);
      return preflightDimensions || geometryRetriever(location);
    },
  };
};

// Standard (non-preflight) resolvers
const standardResolver = (): Resolvers => {
  return {
    streamResolver: async ({ id }: { id: string }) => {
      return s3Stream(defaultStreamLocation(id));
    },
    geometryFunction: async ({
      id,
    }: {
      id: string;
    }): Promise<ImageGeometry> => {
      return geometryRetriever(defaultStreamLocation(id));
    },
  };
};

export const resolverFactory = (
  event: LambdaEvent,
  preflight: boolean,
): Resolvers => {
  debug(`Using ${preflight ? "preflight" : "standard"} resolver`);
  return preflight ? preflightResolver(event) : standardResolver();
};
