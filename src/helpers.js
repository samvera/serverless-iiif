const eventPath = (event) => {
  if (includeStage(event)) {
    const path = '/' + event.requestContext.stage + event.path;
    return path.replace(/\/*$/, '');
  }
  return event.path.replace(/\/*$/, '');
};

const fileMissing = (event) => {
  return !/\.(jpe?g|tiff?|gif|png|webp|json)$/.test(event.path);
};

const getUri = (event) => {
  const scheme = event.headers['X-Forwarded-Proto'] || 'http';
  const host = process.env.forceHost || event.headers['X-Forwarded-Host'] || event.headers.Host;
  const uri = `${scheme}://${host}${eventPath(event)}`;
  return uri;
};

const includeStage = (event) => {
  if ('includeStage' in process.env) {
    return ['true', 'yes'].indexOf(process.env.includeStage.toLowerCase()) > -1;
  } else {
    const host = event.headers.Host;
    return host.match(/\.execute-api\.\w+?-\w+?-\d+?\.amazonaws\.com$/);
  }
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
  includeStage: includeStage,
  isBase64: isBase64,
  isTooLarge: isTooLarge,
  getRegion: getRegion,
  parseDensity: parseDensity
};
