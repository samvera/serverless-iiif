import { LambdaEvent, LambdaResponse, LambdaContext } from './contracts';
import {
  DimensionFunction,
  Processor,
  StreamResolver,
  ContentResult,
  ProcessorResult,
} from "iiif-processor";
import createDebug from "debug";
import {
  addCorsHeaders,
  parseDensity,
  getUri,
  inspect,
  isBrowserAutoFetch,
} from "./helpers";
import { resolverFactory } from "./resolvers";
import { streamifyResponse } from "./streamify";
import sharp from "sharp";

const debug = createDebug("serverless-iiif:lambda");
const debugVerbose = createDebug("serverless-iiif-v:lambda");

// Small route helpers reduce complexity of the main handler
const isOptions = (event: LambdaEvent): boolean =>
  event.requestContext?.http?.method === "OPTIONS";
const isRoot = (event: LambdaEvent): boolean =>
  event?.requestContext?.http?.path === "/";
const isPing = (event: LambdaEvent): boolean =>
  /^\/iiif\/\d+\/?$/.test(event?.requestContext?.http?.path || "");

const handleOptions = () => ({ statusCode: 204, body: "" });
const handlePing = () => ({
  statusCode: 200,
  headers: { "Content-Type": "text/plain" },
  isBase64Encoded: false,
  body: "OK",
});
const handleNotFound = () => ({
  statusCode: 404,
  headers: { "Content-Type": "text/plain" },
  isBase64Encoded: false,
  body: "Not Found",
});

const handleRequestFunc = streamifyResponse(
  async (event: LambdaEvent, context: LambdaContext) => {
    debugVerbose(`Event: ${inspect(event)}`);
    debug(`http path: ${event?.requestContext?.http?.path}`);
    context.callbackWaitsForEmptyEventLoop = false;

    if (isPing(event)) return handlePing();

    let response: LambdaResponse;
    if (isOptions(event)) {
      response = handleOptions();
    } else if (isRoot(event)) {
      response = handleServiceDiscoveryRequestFunc();
    } else if (isBrowserAutoFetch(event?.requestContext?.http?.path)) {
      response = handleNotFound();
    } else {
      response = await handleImageRequest(event, context);
    }
    return addCorsHeaders(event, response);
  }
);

const handleServiceDiscoveryRequestFunc = () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    isBase64Encoded: false,
    body: JSON.stringify({
      links: [
        {
          href: "/iiif/2/{:id}",
          name: "IIIF Image API v2 endpoint",
        },
        {
          href: "/iiif/3/{:id}",
          name: "IIIF Image API v3 endpoint",
        },
      ],
      versions: { ...sharp.versions },
    }),
  };
};

const buildProcessor = (
  uri: string,
  streamResolver: StreamResolver,
  dimensionFunction: DimensionFunction,
  density?: number,
  sharpOptions: Record<string, any> = {}
) => {
  const debugBorder = process.env.debugBorder === "true";
  const pageThreshold =
    parseInt(process.env.pageThreshold as string) || undefined;
  return new Processor(uri, streamResolver, {
    dimensionFunction,
    density,
    debugBorder,
    pageThreshold,
    sharpOptions,
  });
};

const executeWithJp2Retry = async (
  uri: string,
  streamResolver: StreamResolver,
  dimensionFunction: DimensionFunction,
  density?: number,
  sharpOptions: Record<string, any> = {}
) => {
  try {
    return await buildProcessor(
      uri,
      streamResolver,
      dimensionFunction,
      density,
      sharpOptions
    ).execute();
  } catch (err: any) {
    if (
      /Invalid tile part index/.test(err.message) &&
      !sharpOptions.jp2?.oneshot
    ) {
      console.warn(
        "Encountered JP2 tile part index error. Trying oneshot load."
      );
      return await buildProcessor(
        uri,
        streamResolver,
        dimensionFunction,
        density,
        {
          ...sharpOptions,
          jp2: { ...sharpOptions.jp2, oneshot: true },
        }
      ).execute();
    }
    throw err;
  }
};

const handleImageRequest = async (
  event: LambdaEvent,
  _context: LambdaContext
): Promise<LambdaResponse> => {
  const density = parseDensity(process.env.density as string);
  const preflight = process.env.preflight === "true";
  const { streamResolver, dimensionResolver } = resolverFactory(
    event,
    preflight
  );
  try {
    const uri = getUri(event);
    const result = await executeWithJp2Retry(
      uri,
      streamResolver,
      dimensionResolver,
      density
    );

    return makeResponse(result);
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { "Content-Type": "text/plain" },
      body: err.message || String(err),
    };
  }
};

const linksHeader = (result: ContentResult): string | undefined => {
  const links = ["canonical", "profile"]
    .map((rel) => ({ rel, property: `${rel}Link` as const }))
    .filter(({ property }) => result[property])
    .map(({ rel, property }) => `<${result[property]}>; rel=${rel}`);
  return links.length > 0 ? links.join(",") : undefined;
};

const makeResponse = (result: ProcessorResult): LambdaResponse => {
  switch (result.type) {
    case "content":
      return {
        statusCode: 200,
        headers: {
          "Content-Type": result.contentType,
          Link: linksHeader(result),
        },
        isBase64Encoded: false,
        body: result.body,
      };
    case "error":
      return {
        statusCode: result.statusCode,
        headers: {
          "Content-Type": "text/plain",
        },
        body: result.message,
      };
    case "redirect":
      return {
        statusCode: 302,
        headers: {
          Location: result.location,
        },
        body: "Redirecting...",
      };
  }
};

export const handler = handleRequestFunc;
