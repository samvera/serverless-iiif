import { StreamResolver, DimensionFunction, IIIFError } from "iiif-processor";
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
  dimensionResolver: DimensionFunction;
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

const calculatePage = (
  { width, height }: { width: number; height: number },
  page: number
) => {
  const scale = 1 / 2 ** page;
  return {
    width: Math.floor(width * scale),
    height: Math.floor(height * scale),
  };
};

const reduceByPages = ({
  width,
  height,
  pages,
}: {
  width: number;
  height: number;
  pages: number;
}) => {
  const result = [{ width, height }];
  for (let page = 1; page < pages; page++) {
    result.push(calculatePage(result[0], page));
  }
  return result;
};

const reduceToLimit = ({
  width,
  height,
  limit,
}: {
  width: number;
  height: number;
  limit: number;
}) => {
  const result = [{ width, height }];
  let page = 1;
  let currentPage = result[result.length - 1];
  while (currentPage.width > limit || currentPage.height > limit) {
    const nextPage = calculatePage(result[0], page++);
    result.push(nextPage);
    currentPage = result[result.length - 1];
  }
  return result;
};

// Retrieve dimensions from S3 metadata
const dimensionRetriever = async (location: {
  Bucket: string;
  Key: string;
}) => {
  const s3 = new S3Client({});
  const cmd = new HeadObjectCommand(location);
  try {
    const response: HeadObjectCommandOutput = await s3.send(cmd);
    const { Metadata } = response;
    if (Metadata?.width && Metadata?.height)
      return calculateDimensions(Metadata);
    return null;
  } catch (err) {
    throw iiifErrorFromS3Error(err, location);
  }
};

const calculateDimensions = (metadata: Record<string, string>) => {
  const result = {
    width: parseInt(metadata.width, 10),
    height: parseInt(metadata.height, 10),
  };
  if (metadata.pages)
    return reduceByPages({ ...result, pages: parseInt(metadata.pages, 10) });
  if (process.env.pyramidLimit)
    return reduceToLimit({
      ...result,
      limit: parseInt(process.env.pyramidLimit as string, 10),
    });
  return [result];
};

const iiifErrorFromS3Error = (
  err: S3ServiceException,
  location: { Bucket: string; Key: string }
) => {
  const message = `Error fetching S3 object metadata at ${util.inspect(
    location
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

const parseDimensionsHeader = (event: LambdaEvent) => {
  const dimensionsHeader = getHeaderValue(event, "x-preflight-dimensions");
  if (!dimensionsHeader) {
    debug("No preflight dimensions header found");
    return null;
  }

  debug(`Preflight dimension header found: ${dimensionsHeader}`);
  const result = JSON.parse(dimensionsHeader);
  if (result.pages) return reduceByPages(result);
  if (result.limit) return reduceToLimit(result);
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
    dimensionResolver: async ({ id }: { id: string }) => {
      const location = preflightLocation || defaultStreamLocation(id);
      return preflightDimensions || dimensionRetriever(location);
    },
  };
};

// Standard (non-preflight) resolvers
const standardResolver = (): Resolvers => {
  return {
    streamResolver: async ({ id }: { id: string }) => {
      return s3Stream(defaultStreamLocation(id));
    },
    dimensionResolver: async ({ id }: { id: string }) => {
      return dimensionRetriever(defaultStreamLocation(id));
    },
  };
};

export const resolverFactory = (
  event: LambdaEvent,
  preflight: boolean
): Resolvers => {
  debug(`Using ${preflight ? "preflight" : "standard"} resolver`);
  return preflight ? preflightResolver(event) : standardResolver();
};
