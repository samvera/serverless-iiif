import { LambdaEvent, LambdaResponse, LambdaContext } from "./contracts";
import {
  ResponseStream,
  streamifyResponse as lambdaStreamifyResponse,
} from "lambda-stream";

/* istanbul ignore next */
const maybeStream = (
  responseStream: ResponseStream,
  prelude: LambdaResponse
) => {
  if (
    "from" in responseStream.constructor &&
    typeof responseStream.constructor.from === "function"
  ) {
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

const stringify = (
  handler: (
    _event: LambdaEvent,
    _context: LambdaContext
  ) => Promise<LambdaResponse>
) => {
  return async (event: LambdaEvent, context: LambdaContext) => {
    const result: LambdaResponse = await handler(event, context);
    const body = result.body.toString("base64");
    return { ...result, isBase64Encoded: true, body };
  };
};

const streamify = (
  handler: (
    _event: LambdaEvent,
    _context: LambdaContext
  ) => Promise<LambdaResponse>
) => {
  return lambdaStreamifyResponse(
    async (
      event: LambdaEvent,
      responseStream: ResponseStream,
      context: LambdaContext
    ) => {
      const result: LambdaResponse = (await handler(event, context)) || {};
      const body = result.body;
      const prelude = { ...result };
      delete prelude.body;
      maybeStream(responseStream, prelude);
      const chunk =
        typeof body === "string" ||
        (body as unknown) instanceof Uint8Array ||
        Buffer.isBuffer(body)
          ? body
          : String(body ?? "");
      responseStream.write(chunk);
      responseStream.end();
    }
  );
};

export const streamifyResponse = (
  handler: (
    _event: LambdaEvent,
    _context: LambdaContext
  ) => Promise<LambdaResponse>
) => {
  if (process.env.STREAMIFY_DISABLED === "true") return stringify(handler);
  return streamify(handler);
};
