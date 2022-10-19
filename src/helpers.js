const eventPath = (event) => {
  return event.requestContext?.http?.path.replace(/\/*$/, '');
};

const fileMissing = (event) => {
  return !/\.(jpe?g|tiff?|jp2|gif|png|webp|json)$/.test(eventPath(event));
};

const getUri = (event) => {
  const scheme = event.headers['x-forwarded-proto'] || 'http';
  const host = process.env.forceHost || event.headers['x-forwarded-host'] || event.headers.host;
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
  eventPath: eventPath,
  fileMissing: fileMissing,
  getUri: getUri,
  isBase64: isBase64,
  isTooLarge: isTooLarge,
  getRegion: getRegion,
  parseDensity: parseDensity
};
