const AWS = require('aws-sdk');
const IIIF = require('iiif-processor');
const cache = require('./cache');
const helpers = require('./helpers');
const resolvers = require('./resolvers');
const { errorHandler } = require('./error');

const handleRequestFunc = async (event, context) => {
  const { addCorsHeaders, eventPath, fileMissing, getRegion } = helpers;

  AWS.config.region = getRegion(context);
  context.callbackWaitsForEmptyEventLoop = false;

  let response;
  if (event.requestContext?.http?.method === 'OPTIONS') {
    // OPTIONS REQUEST
    response = { statusCode: 204, body: null };
  } else if (fileMissing(event)) {
    // INFO.JSON REQUEST
    response = {
      statusCode: 302,
      headers: {
        'Cache-Control': 'no-store',
        Location: eventPath(event) + '/info.json'
      },
      body: 'Redirecting to info.json'
    };
  } else {
    // IMAGE REQUEST
    response = await handleResourceRequestFunc(event, context);
  }
  return addCorsHeaders(event, response);
};

const handleResourceRequestFunc = async (event, context) => {
  const density = helpers.parseDensity(process.env.density);
  const { getUri } = helpers;
  const preflight = process.env.preflight === 'true';
  const { streamResolver, dimensionResolver } = resolvers.resolverFactory(event, preflight);

  let resource;
  try {
    const uri = getUri(event);
    resource = new IIIF.Processor(uri, streamResolver, { dimensionFunction: dimensionResolver, density: density });
    if (resource.id === '' || resource.id === undefined || resource.id === null) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        isBase64Encoded: false,
        body: 'OK'
      };
    } else {
      return await handleImageRequestFunc(uri, resource);
    }
  } catch (err) {
    return errorHandler(err, event, context, resource);
  }
};

const handleImageRequestFunc = async (uri, resource) => {
  const { isTooLarge } = helpers;
  const { getCached, makeCache } = cache;

  const cacheable = resource.filename !== 'info.json';
  const key = new URL(uri).pathname.replace(/^\//, '');
  const cached = cacheable && await getCached(key);

  let response;
  if (cached) {
    response = forceFailover();
  } else {
    const result = await resource.execute();

    if (isTooLarge(result.body)) {
      await makeCache(key, result);
      response = forceFailover();
    } else {
      response = makeResponse(result);
    }
  }
  if (!cacheable) {
    response.headers['Cache-Control'] = 'no-store';
  }
  return response;
};

const forceFailover = () => {
  return {
    statusCode: 404, // Use 404 to force CloudFront to fail over to the cache
    isBase64Encoded: false,
    body: ''
  };
};

const makeResponse = (result) => {
  const { isBase64 } = helpers;

  const base64 = isBase64(result);
  const content = base64 ? result.body.toString('base64') : result.body;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': result.contentType
    },
    isBase64Encoded: base64,
    body: content
  };
};

module.exports = {
  handler: handleRequestFunc
};
