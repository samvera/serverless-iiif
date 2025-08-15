import { LambdaFunctionURLEvent as Event, Context, APIGatewayProxyStructuredResultV2 as Response } from 'aws-lambda';
import { ResponseStream, streamifyResponse as lambdaStreamifyResponse } from 'lambda-stream';

/* istanbul ignore next */
const maybeStream = (responseStream: ResponseStream, prelude: Response) => {
  if ('from' in responseStream.constructor && typeof responseStream.constructor.from === 'function') {
    responseStream.constructor.from(responseStream, prelude);
  } else {
    responseStream.setContentType(
      "application/vnd.awslambda.http-integration-response"
    );
    const preludeJson = JSON.stringify(prelude ?? {});
    responseStream.write(preludeJson ?? "");
    responseStream.write(Buffer.alloc(8));
  }
};

export const streamifyResponse = (handler: (_event: Event, _context: Context) => Promise<Response>) => {
  return lambdaStreamifyResponse(async (event: Event, responseStream: ResponseStream, context: Context) => {
    const result: Response = (await handler(event, context)) || {};
    const body = result.body;
    const prelude = { ...result };
    delete prelude.body;
    maybeStream(responseStream, prelude);
    const chunk =
      typeof body === 'string' || (body as unknown) instanceof Uint8Array || Buffer.isBuffer(body)
        ? body
        : String(body ?? '');
    responseStream.write(chunk);
    responseStream.end();
  });
};
