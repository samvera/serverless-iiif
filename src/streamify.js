const { streamifyResponse } = require('lambda-stream');

const streamableHandler = (handler) => {
  return streamifyResponse(async (event, responseStream, context) => {
    const { body, ...prelude } = await handler(event, context);
    /* istanbul ignore next */
    if (responseStream.constructor.from) {
      /* istanbul ignore next */
      responseStream.constructor.from(responseStream, prelude);
    } else {
      responseStream.setContentType('application/vnd.awslambda.http-integration-response');
      responseStream.write(JSON.stringify(prelude));
      responseStream.write(new Uint8Array(8));
    }
    responseStream.write(body || '');
    responseStream.end();
  });
};

module.exports = { streamifyResponse: streamableHandler };
