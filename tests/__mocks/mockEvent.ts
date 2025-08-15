import { APIGatewayProxyEventV2 } from 'aws-lambda';

const defaultEvent: APIGatewayProxyEventV2 = {
  version: '2.0',
  routeKey: 'GET /test',
  rawPath: '/test',
  rawQueryString: '',
  headers: {
    'content-type': 'application/json'
  },
  requestContext: {
    accountId: '123456789012',
    apiId: 'api-id',
    domainName: 'api.example.com',
    domainPrefix: 'api',
    http: {
      method: 'GET',
      path: '/test',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test-agent'
    },
    requestId: 'request-id',
    routeKey: 'GET /test',
    stage: 'test',
    time: '09/Apr/2015:12:34:56 +0000',
    timeEpoch: 1428582896000
  },
  isBase64Encoded: false
};

export default function mockEvent(overrides = {}): APIGatewayProxyEventV2 {
  return { ...defaultEvent, ...overrides };
}