import {
  LambdaFunctionURLEvent,
  APIGatewayProxyStructuredResultV2,
  Context,
} from "aws-lambda";

export type LambdaEvent = LambdaFunctionURLEvent;
export type LambdaContext = Context;
export type LambdaResponse = Omit<APIGatewayProxyStructuredResultV2, "body"> & {
  body?: string | Buffer | Uint8Array | undefined;
};
