const AWS = require('aws-sdk');
const sourceBucket = process.env.tiffBucket;

// IIIF RESOLVERS
const streamResolver = async (id, callback) => {
  const s3 = new AWS.S3();
  const key = id + '.tif';
  const request = s3.getObject({ Bucket: sourceBucket, Key: key });
  const stream = request.createReadStream();
  try {
    return await callback(stream);
  } finally {
    stream.end().destroy();
    request.abort();
  }
};

const dimensionResolver = async (id) => {
  const s3 = new AWS.S3();
  const obj = await s3.headObject({
    Bucket: sourceBucket,
    Key: `${id}.tif`
  }).promise();
  if (obj.Metadata.width && obj.Metadata.height) {
    return {
      width: parseInt(obj.Metadata.width, 10),
      height: parseInt(obj.Metadata.height, 10)
    };
  }
  return null;
};

module.exports = {
  streamResolver: streamResolver,
  dimensionResolver: dimensionResolver,
}
