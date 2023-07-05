const { ResponseStream } = require('lambda-stream');

module.exports = async (handler, event, context) => {
  const responseStream = new ResponseStream();
  const result = await handler(event, responseStream, context);
  expect(result.statusCode).toEqual(200);
  expect(result.headers['content-type']).toEqual('application/vnd.awslambda.http-integration-response');
  const payload = responseStream.getBufferedData().toString('UTF-8');
  const [prelude, body] = payload.split(/\u0000{8}/);
  return { ...JSON.parse(prelude), body };
};
