import { LambdaEvent, LambdaResponse } from './contracts';

const SafelistedResponseHeaders =
  'cache-control,content-language,content-length,content-type,date,expires,last-modified,pragma';

const CorsDefaults: Record<string, string> = {
  AllowCredentials: 'false',
  AllowOrigin: '*',
  AllowHeaders: '*',
  ExposeHeaders: SafelistedResponseHeaders,
  MaxAge: '3600'
};

export const corsSetting = (name: string): string => {
  return (process.env[`cors${name}`] as string) || CorsDefaults[name];
};

export const getHeaderValue = (event: LambdaEvent, header: string): string | null => {
  const headerName = Object.keys(event.headers || {}).find(
    (h) => h.toLowerCase() === header
  );
  if (headerName) return event.headers[headerName];
  return null;
};

export const allowOriginValue = (corsAllowOrigin: string, event: LambdaEvent): string => {
  if (corsAllowOrigin === 'REFLECT_ORIGIN') {
    return getHeaderValue(event, 'origin') || '*';
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
    "Access-Control-Max-Age": corsSetting("MaxAge")
  };
  return response;
};

export const eventPath = (event: LambdaEvent): string => {
  return (event.requestContext?.http?.path || '').replace(/\/*$/, '');
};

export const fileMissing = (event: LambdaEvent): boolean => {
  return !/\.(jpe?g|tiff?|jp2|gif|png|webp|json)$/.test(eventPath(event));
};

export const getUri = (event: LambdaEvent): string => {
  const scheme = getHeaderValue(event, 'x-forwarded-proto') || 'http';
  const host =
    process.env.forceHost ||
    getHeaderValue(event, 'x-forwarded-host') ||
    getHeaderValue(event, 'host');
  const uri = `${scheme}://${host}${eventPath(event)}`;
  return uri;
};

export const parseDensity = (value?: string): number | undefined => {
  const result = Number(value);
  if (isNaN(result) || result < 0) return undefined;
  return result;
};

