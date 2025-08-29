import { LambdaFunctionURLEvent, APIGatewayProxyStructuredResultV2, Context } from "aws-lambda";
import { Processor } from "iiif-processor";

export type LambdaEvent = LambdaFunctionURLEvent;
export type LambdaContext = Context;
export type LambdaResponse = Omit<APIGatewayProxyStructuredResultV2, 'body'> & {
  body?: string | Buffer | Uint8Array | undefined;
};
export type ProcessorResult = Awaited<ReturnType<InstanceType<typeof Processor>["execute"]>>;
