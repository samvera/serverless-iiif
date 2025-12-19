import { LambdaEvent, LambdaResponse } from "./contracts";
import util from "util";

const BrowserAutoFetchPatterns = [
  // Favicons
  /^\/favicon(?:-\d+x\d+)?\.(?:ico|png|svg)(?:$|[?#])/i,

  // Apple / Android icons
  /^\/apple-touch-icon(?:-precomposed)?(?:-\d+x\d+)?\.png(?:$|[?#])/i,
  /^\/(?:android-chrome|mstile)-\d+x\d+\.png(?:$|[?#])/i,

  // Safari pinned tab, MS browser config
  /^\/safari-pinned-tab\.svg(?:$|[?#])/i,
  /^\/browserconfig\.xml(?:$|[?#])/i,

  // Web app manifests
  /^\/(?:site\.webmanifest|manifest\.json)(?:$|[?#])/i,

  // Common text metadata
  /^\/(?:robots|humans)\.txt(?:$|[?#])/i,

  // Service worker
  /^\/service-worker(?:\.min)?\.js(?:$|[?#])/i,

  // Apple app association
  /^\/apple-app-site-association(?:\.json)?(?:$|[?#])/i,

  // Well-known endpoints
  /^\/\.well-known\/(?:change-password|security\.txt|assetlinks\.json|apple-app-site-association|openid-configuration|webfinger)(?:$|[?#])/i,
];

const SafelistedResponseHeaders =
  "cache-control,content-language,content-length,content-type,date,expires,last-modified,pragma";

const CorsDefaults: Record<string, string> = {
  AllowCredentials: "false",
  AllowOrigin: "*",
  AllowHeaders: "*",
  ExposeHeaders: SafelistedResponseHeaders,
  MaxAge: "3600",
};

const DefaultPorts: Record<string, string> = {
  http: "80",
  https: "443",
};

export const corsSetting = (name: string): string => {
  return (process.env[`cors${name}`] as string) || CorsDefaults[name];
};

export const getHeaderValue = (
  event: LambdaEvent,
  header: string,
  defaultValue: string | null = null
): string | null => {
  const headerName = Object.keys(event.headers || {}).find(
    (h) => h.toLowerCase() === header
  );
  if (headerName) return event.headers[headerName];
  return defaultValue;
};

export const allowOriginValue = (
  corsAllowOrigin: string,
  event: LambdaEvent
): string => {
  if (corsAllowOrigin === "REFLECT_ORIGIN") {
    return getHeaderValue(event, "origin", "*");
  }
  return corsAllowOrigin;
};

export const addCorsHeaders = (
  event: LambdaEvent,
  response: LambdaResponse
): LambdaResponse => {
  response.headers = {
    ...response.headers,
    "Access-Control-Allow-Credentials": corsSetting("AllowCredentials"),
    "Access-Control-Allow-Origin": allowOriginValue(
      corsSetting("AllowOrigin"),
      event
    ),
    "Access-Control-Allow-Headers": corsSetting("AllowHeaders"),
    "Access-Control-Expose-Headers": corsSetting("ExposeHeaders"),
    "Access-Control-Max-Age": corsSetting("MaxAge"),
  };
  return response;
};

export const eventPath = (event: LambdaEvent): string => {
  return event.requestContext.http.path.replace(/\/*$/, "");
};

export const getUri = (event: LambdaEvent): string => {
  const scheme = getHeaderValue(event, "x-forwarded-proto", "http");
  let host =
    process.env.forceHost ||
    getHeaderValue(event, "x-forwarded-host") ||
    getHeaderValue(event, "host");
  let port;
  if (host?.includes(":")) {
    [host, port] = host.split(":");
  } else {
    port = getHeaderValue(event, "x-forwarded-port", DefaultPorts[scheme]);
  }
  const uri = new URL(
    `${scheme}://${host}:${port}${eventPath(event)}`
  ).toString();
  return uri;
};

export const parseDensity = (value?: string): number | undefined => {
  const result = Number(value);
  if (isNaN(result) || result < 0) return undefined;
  return result;
};

export const isBrowserAutoFetch = (path: string): boolean => {
  return BrowserAutoFetchPatterns.some((re) => re.test(path));
};

export const inspect = (obj: any) =>
  util.inspect(obj, { depth: Infinity, compact: false });
