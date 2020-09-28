/*
 * IMPLEMENTATION NOTE: API Gateway Lambda functions have a
 * ~6MB payload limit. See LAMBDA_LIMIT.md for implications
 * and a workaround.
 */

const AWS = require('aws-sdk');
const IIIF = require('iiif-processor');
const helpers = require('./helpers')
const resolvers = require('./resolvers');
const errorHandler = require('./error')

const handleRequestFunc = async (event, context, callback) => {
  const { eventPath, fileMissing, getUri, isBase64, isTooLarge, getRegion } = helpers;
  const { streamResolver, dimensionResolver } = resolvers;
  AWS.config.region = getRegion(context);

  // OPTIONS REQUEST
  if (event.httpMethod === 'OPTIONS') {
    return await callback(null, { statusCode: 204, body: null });
  }
  // INFO.JSON REQUEST
  else if (fileMissing(event)) {
    const location = eventPath(event) + '/info.json';
    return await callback(null, { statusCode: 302, headers: { 'Location': location }, body: 'Redirecting to info.json' });
  }
  // IMAGE REQUEST
  else {
    const uri = getUri(event);
    const resource = new IIIF.Processor(
      uri,
      streamResolver,
      dimensionResolver
    );
    const result = await resource.execute();
    try {
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
        throw Error (`Content size (${content.length.toString()}) exceeds API gateway maximum when calling ${uri}`);
      } else {
        return await callback(null, response);
      }
    } catch (err) {
      return errorHandler.errorHandler(err, event, context, resource, callback);
    }
  }
};

module.exports = {
  handler: handleRequestFunc,
};
