import { 
  LambdaFunctionURLEvent as Event, 
  APIGatewayProxyStructuredResultV2 as Response,
  Context 
} from 'aws-lambda';
import { DimensionFunction, Processor, StreamResolver } from 'iiif-processor';
import createDebug from 'debug';
import { addCorsHeaders, eventPath, fileMissing, parseDensity, getUri } from './helpers';
import { resolverFactory } from './resolvers';
import { errorHandler } from './error';
import { streamifyResponse } from './streamify';
import sharp from 'sharp';

const debug = createDebug('serverless-iiif:lambda');

type ExecuteResult = Awaited<ReturnType<InstanceType<typeof Processor>['execute']>>;

// Small route helpers reduce complexity of the main handler
const isOptions = (event: Event): boolean => event.requestContext?.http?.method === 'OPTIONS';
const isRoot = (event: Event): boolean => event?.requestContext?.http?.path === '/';
const isPing = (event: Event): boolean => /^\/iiif\/\d+\/?$/.test(event?.requestContext?.http?.path || '');
const shouldRedirectToInfo = (event: Event): boolean => fileMissing(event);

const handleOptions = () => ({ statusCode: 204, body: '' });
const handlePing = () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'text/plain' },
  isBase64Encoded: false,
  body: 'OK'
});
const handleInfoRedirect = (event: Event) => ({
  statusCode: 302,
  headers: { Location: eventPath(event) + '/info.json' },
  body: 'Redirecting to info.json'
});

// eslint-disable-next-line complexity
const handleRequestFunc = streamifyResponse(async (event: Event, context: Context) => {
  debug('http path: ', event?.requestContext?.http?.path);
  context.callbackWaitsForEmptyEventLoop = false;

  if (isPing(event)) return handlePing();

  let response: Response;
  if (isOptions(event)) {
    response = handleOptions();
  } else if (isRoot(event)) {
    response = handleServiceDiscoveryRequestFunc();
  } else if (shouldRedirectToInfo(event)) {
    response = handleInfoRedirect(event);
  } else {
    response = await handleImageRequest(event, context);
  }
  return addCorsHeaders(event, response);
});

const handleServiceDiscoveryRequestFunc = () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    isBase64Encoded: false,
    body: JSON.stringify({
      links: [
        {
          href: '/iiif/2/{:id}',
          name: 'IIIF Image API v2 endpoint'
        },
        {
          href: '/iiif/3/{:id}',
          name: 'IIIF Image API v3 endpoint'
        }
      ],
      versions: { ...sharp.versions }
    })
  };
};

const buildProcessor = (
  uri: string,
  streamResolver: StreamResolver,
  dimensionFunction: DimensionFunction,
  density?: number,
  sharpOptions: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  const debugBorder = process.env.debugBorder === 'true';
  const pageThreshold = parseInt(process.env.pageThreshold as string) || undefined;
  return new Processor(uri, streamResolver, {
    dimensionFunction,
    density,
    debugBorder,
    pageThreshold,
    sharpOptions
  });
};

const executeWithJp2Retry = async (
  uri: string,
  streamResolver: StreamResolver,
  dimensionFunction: DimensionFunction,
  density?: number,
  sharpOptions: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  try {
    return await buildProcessor(uri, streamResolver, dimensionFunction, density, sharpOptions).execute();
  } catch (err: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
    if (/Invalid tile part index/.test(err.message) && !sharpOptions.jp2Oneshot) {
      console.log('Encountered JP2 tile part index error. Trying oneshot load.');
      return await buildProcessor(
        uri,
        streamResolver,
        dimensionFunction,
        density,
        { ...sharpOptions, jp2Oneshot: true }
      ).execute();
    }
    throw err;
  }
};

const handleImageRequest = async (event: Event, context: Context): Promise<Response> => {
  const density = parseDensity(process.env.density as string);
  const preflight = process.env.preflight === 'true';
  const { streamResolver, dimensionResolver } = resolverFactory(event, preflight);
  try {
    const uri = getUri(event);
    const result = await executeWithJp2Retry(uri, streamResolver, dimensionResolver, density);
    return makeResponse(result);
  } catch (err) {
    return errorHandler(err, event, context);
  }
};

const linksHeader = (result: ExecuteResult): string | undefined => {
  const links = ['canonical', 'profile']
    .map((rel) => ({ rel, property: `${rel}Link` as const }))
    .filter(({ property }) => result[property])
    .map(({ rel, property }) => `<${result[property]}>; rel=${rel}`);
  return links.length > 0 ? links.join(',') : undefined;
};

const makeResponse = (result: ExecuteResult): Response => ({
  statusCode: 200,
  headers: {
    'Content-Type': result.contentType,
    Link: linksHeader(result)
  },
  isBase64Encoded: false,
  body: result.body.toString()
});

export const handler = handleRequestFunc;
