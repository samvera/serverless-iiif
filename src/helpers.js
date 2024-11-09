const SafelistedResponseHeaders = 'cache-control,content-language,content-length,content-type,date,expires,last-modified,pragma';
const CorsDefaults = {
  AllowCredentials: 'false',
  AllowOrigin: '*',
  AllowHeaders: '*',
  ExposeHeaders: SafelistedResponseHeaders,
  MaxAge: '3600'
};

const corsSetting = (name) => {
  return process.env[`cors${name}`] || CorsDefaults[name];
};

const allowOriginValue = (corsAllowOrigin, event) => {
  if (corsAllowOrigin === 'REFLECT_ORIGIN') {
    return getHeaderValue(event, 'origin') || '*';
  }
  return corsAllowOrigin;
};

const addCorsHeaders = (event, response) => {
  response.headers = {
    ...response.headers,
    'Access-Control-Allow-Credentials': corsSetting('AllowCredentials'),
    'Access-Control-Allow-Origin': allowOriginValue(corsSetting('AllowOrigin'), event),
    'Access-Control-Allow-Headers': corsSetting('AllowHeaders'),
    'Access-Control-Expose-Headers': corsSetting('ExposeHeaders'),
    'Access-Control-Max-Age': corsSetting('MaxAge')
  };
  return response;
};

const eventPath = (event) => {
  return event.requestContext?.http?.path.replace(/\/*$/, '');
};

const fileMissing = (event) => {
  return !/\.(jpe?g|tiff?|jp2|gif|png|webp|json)$/.test(eventPath(event));
};

const getHeaderValue = (event, header) => {
  const headerName = Object.keys(event.headers).find((h) => h.toLowerCase() === header);
  if (headerName) return event.headers[headerName];
  return null;
};

const getUri = (event) => {
  const scheme = getHeaderValue(event, 'x-forwarded-proto') || 'http';
  const host = process.env.forceHost || getHeaderValue(event, 'x-forwarded-host') || getHeaderValue(event, 'host');
  const uri = `${scheme}://${host}${eventPath(event)}`;
  return uri;
};

const isBase64 = (result) => {
  return /^image\//.test(result.contentType);
};

const isTooLarge = (content) => {
  const payloadLimit = (6 * 1024 * 1024) / 1.4;
  return content.length > payloadLimit;
};

const getRegion = (context) => {
  return context.invokedFunctionArn.match(/^arn:aws:lambda:(\w+-\w+-\d+):/)[1];
};

const parseDensity = (value) => {
  const result = Number(value);
  if (isNaN(result) || result < 0) return undefined;
  return result;
};

module.exports = {
  addCorsHeaders,
  eventPath,
  fileMissing,
  getHeaderValue,
  getUri,
  isBase64,
  isTooLarge,
  getRegion,
  parseDensity
};
