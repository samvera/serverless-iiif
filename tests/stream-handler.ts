import { ResponseStream } from 'lambda-stream';

export default async (handler, event, context) => {
  const responseStream = new ResponseStream();
  const result = await handler(event, responseStream, context);
  expect(result.statusCode).toEqual(200);
  expect(result.headers['content-type']).toEqual(
    'application/vnd.awslambda.http-integration-response'
  );
  const payload = responseStream.getBufferedData().toString('utf8');
  const [prelude, body] = payload.split(/\u0000{8}/);
  return { ...JSON.parse(prelude), body };
};
