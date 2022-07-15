const AWS = require('aws-sdk');
const IIIF = require('iiif-processor');
const cache = require('./cache');
const helpers = require('./helpers');
const resolvers = require('./resolvers');
const { errorHandler } = require('./error');

const density = helpers.parseDensity(process.env.density);
const preflight = process.env.preflight === 'true';

const handleRequestFunc = async (event, context) => {
  const { eventPath, fileMissing, getRegion } = helpers;

  AWS.config.region = getRegion(context);
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.requestContext?.http?.method === 'OPTIONS') {
    // OPTIONS REQUEST
    return { statusCode: 204, body: null };
  } else if (fileMissing(event)) {
    // INFO.JSON REQUEST
    const location = eventPath(event) + '/info.json';
    return { statusCode: 302, headers: { Location: location }, body: 'Redirecting to info.json' };
  } else {
    // IMAGE REQUEST
    return await handleImageRequestFunc(event, context);
  }
};

const handleImageRequestFunc = async (event, context) => {
  const { getUri, isTooLarge } = helpers;
  const { streamResolver, dimensionResolver } = resolvers.resolverFactory(event, preflight);
  const { getCached, makeCache } = cache;

  let resource;
  try {
    const uri = getUri(event);
    resource = new IIIF.Processor(uri, streamResolver, { dimensionFunction: dimensionResolver, density: density });
    
    if (resource.id === "" || resource.id === undefined || resource.id === null) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        isBase64Encoded: false,
        body: 'OK'
      };
    }

    const key = new URL(uri).pathname.replace(/^\//, '');
    const cached = resource.filename === 'info.json' ? false : await getCached(key);

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
    return response;
  } catch (err) {
    return errorHandler(err, event, context, resource);
  }
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
