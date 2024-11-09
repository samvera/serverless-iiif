const { S3Client, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getHeaderValue } = require('./helpers');
const URI = require('uri-js');
const util = require('util');

// IIIF RESOLVERS

// Create input stream from S3 location
const s3Stream = async (location, callback) => {
  const s3 = new S3Client();
  const cmd = new GetObjectCommand(location);
  const { Body } = await s3.send(cmd);
  return await callback(Body);
};

// Compute default stream location from ID
const defaultStreamLocation = (id) => {
  const sourceBucket = process.env.tiffBucket;
  const resolverTemplate = process.env.resolverTemplate || '%s.tif';
  const replacementCount = resolverTemplate.match(/%.*?s/g).length;
  const args = new Array(replacementCount).fill(id);
  const key = util.format(resolverTemplate, ...args);

  return { Bucket: sourceBucket, Key: key };
};

const calculatePage = ({ width, height }, page) => {
  const scale = 1 / 2 ** page;
  return {
    width: Math.floor(width * scale),
    height: Math.floor(height * scale)
  };
};

const reduceByPages = ({ width, height, pages }) => {
  const result = [{ width, height }];
  for (let page = 1; page < pages; page++) {
    result.push(calculatePage(result[0], page));
  }
  return result;
};

const reduceToLimit = ({ width, height, limit }) => {
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
const dimensionRetriever = async (location) => {
  const s3 = new S3Client();
  const cmd = new HeadObjectCommand(location);
  const response = await s3.send(cmd);
  const { Metadata } = response;
  if (Metadata.width && Metadata.height) {
    const result = {
      width: parseInt(Metadata.width, 10),
      height: parseInt(Metadata.height, 10)
    };
    if (Metadata.pages) return reduceByPages({ ...result, pages: parseInt(Metadata.pages) });
    if (process.env.pyramidLimit) return reduceToLimit({ ...result, limit: parseInt(process.env.pyramidLimit) });
    return [result];
  }
  return null;
};

// Preflight resolvers
const parseLocationHeader = (event) => {
  const locationHeader = getHeaderValue(event, 'x-preflight-location');
  if (locationHeader && locationHeader.match(/^s3:\/\//)) {
    const parsedURI = URI.parse(locationHeader);
    return { Bucket: parsedURI.host, Key: parsedURI.path.slice(1) };
  };
  return null;
};

const parseDimensionsHeader = (event) => {
  const dimensionsHeader = getHeaderValue(event, 'x-preflight-dimensions');
  if (!dimensionsHeader) return null;

  const result = JSON.parse(dimensionsHeader);
  if (result.pages) return reduceByPages(result);
  if (result.limit) return reduceToLimit(result);
  return result;
};

const preflightResolver = (event) => {
  const preflightLocation = parseLocationHeader(event);
  const preflightDimensions = parseDimensionsHeader(event);

  return {
    streamResolver: async ({ id }, callback) => {
      const location = preflightLocation || defaultStreamLocation(id);
      return s3Stream(location, callback);
    },
    dimensionResolver: async ({ id }) => {
      const location = preflightLocation || defaultStreamLocation(id);
      return preflightDimensions || dimensionRetriever(location);
    }
  };
};

// Standard (non-preflight) resolvers
const standardResolver = () => {
  return {
    streamResolver: async ({ id }, callback) => {
      return s3Stream(defaultStreamLocation(id), callback);
    },
    dimensionResolver: async ({ id }) => {
      return dimensionRetriever(defaultStreamLocation(id));
    }
  };
};

const resolverFactory = (event, preflight) => {
  return preflight ? preflightResolver(event) : standardResolver();
};

module.exports = { resolverFactory };
