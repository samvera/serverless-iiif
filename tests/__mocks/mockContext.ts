import { Context } from "aws-lambda";

const defaultContext: Context = {
  callbackWaitsForEmptyEventLoop: true,
  functionName: "test-function",
  functionVersion: "$LATEST",
  invokedFunctionArn: "arn:aws:lambda:us-east-1:123456789012:function:test-function",
  memoryLimitInMB: "128",
  awsRequestId: "test-request-id",
  logGroupName: "/aws/lambda/test-function",
  logStreamName: "2023/01/01/[$LATEST]test-stream",
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {}
};

export default function mockContext(overrides = {}): Context {
  return { ...defaultContext, ...overrides };
}