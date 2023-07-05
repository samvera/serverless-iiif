const AWS = require('aws-sdk');
const IIIF = require('iiif-processor');
const helpers = require('./helpers');
const resolvers = require('./resolvers');
const { errorHandler } = require('./error');
const { streamifyResponse } = require('./streamify');

const handleRequestFunc = streamifyResponse(async (event, context) => {
  const { addCorsHeaders, eventPath, fileMissing, getRegion } = helpers;

  AWS.config.region = getRegion(context);
  context.callbackWaitsForEmptyEventLoop = false;

  let response;
  if (event.requestContext?.http?.method === 'OPTIONS') {
    // OPTIONS REQUEST
    response = { statusCode: 204, body: null };
  } else if (fileMissing(event)) {
    // INFO.JSON REQUEST
    const location = eventPath(event) + '/info.json';
    response = { statusCode: 302, headers: { Location: location }, body: 'Redirecting to info.json' };
  } else {
    // IMAGE REQUEST
    response = await handleResourceRequestFunc(event, context);
  }
  return addCorsHeaders(event, response);
});

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
      const result = await resource.execute();
      return makeResponse(result);
    }
  } catch (err) {
    return errorHandler(err, event, context, resource);
  }
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
