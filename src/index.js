/*
 * IMPLEMENTATION NOTE: API Gateway Lambda functions have a
 * ~6MB payload limit. See LAMBDA_LIMIT.md for implications
 * and a workaround.
 */

const AWS = require('aws-sdk');
const IIIF = require('iiif-processor');
const helpers = require('./helpers');
const resolvers = require('./resolvers');
const errorHandler = require('./error');

const handleRequestFunc = async (event, context, callback) => {
  const { eventPath, fileMissing, getRegion } = helpers;

  AWS.config.region = getRegion(context);
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod === 'OPTIONS') {
    // OPTIONS REQUEST
    return callback(null, { statusCode: 204, body: null });
  } else if (fileMissing(event)) {
    // INFO.JSON REQUEST
    const location = eventPath(event) + '/info.json';
    return callback(null, { statusCode: 302, headers: { Location: location }, body: 'Redirecting to info.json' });
  } else {
    // IMAGE REQUEST
    return await handleImageRequestFunc(event, context, callback);
  }
};

const handleImageRequestFunc = async (event, context, callback) => {
  const { getUri, isBase64, isTooLarge } = helpers;
  const { streamResolver, dimensionResolver } = resolvers;

  let resource;
  try {
    const uri = getUri(event);
    resource = new IIIF.Processor(uri, streamResolver, dimensionResolver);
    const result = await resource.execute();

    const base64 = isBase64(result);
    const content = base64 ? result.body.toString('base64') : result.body;
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': result.contentType,
        'Access-Control-Allow-Origin': '*'
      },
      isBase64Encoded: base64,
      body: content
    };
    if (isTooLarge(content)) {
      const uri = getUri(event);
      throw Error(`Content size (${content.length.toString()}) exceeds API gateway maximum when calling ${uri}`);
    } else {
      return callback(null, response);
    }
  } catch (err) {
    return errorHandler.errorHandler(err, event, context, resource, callback);
  }
};

module.exports = {
  handler: handleRequestFunc
};
