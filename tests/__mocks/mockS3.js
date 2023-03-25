/* eslint-env jest */
const destroy = jest.fn();
const end = jest.fn(() => {
  return {
    destroy: destroy
  };
});
const abort = jest.fn();
const checkParams = jest.fn();

const S3 = jest.fn().mockImplementation(() => {
  return {
    getObject: function (params) {
      checkParams('S3.getObject', params);
      return {
        createReadStream: () => {
          return {
            end: end
          };
        },
        abort: abort
      };
    },
    headObject: function (params) {
      checkParams('S3.headObject', params);
      let md = {};
      if (params.Key === 'dimensions.tif') {
        md = { width: '2048', height: '1536' };
      }
      if (params.Key === 'paged-dimensions.tif') {
        md = { width: '2048', height: '1536', pages: '5' };
      }
      return {
        promise: () => {
          return {
            Metadata: md
          };
        },
      };
    }
  };
});

const upload = jest.fn((params, callback) => {
  checkParams('upload', params);
  if (params.Key === 'new_cache_key/default.jpg') {
    callback(null, {});
  } else {
    callback('unknown cache key', null);
  }
});

const S3Cache = jest.fn().mockImplementation(() => {
  return {
    headObject: function (params, callback) {
      checkParams('S3Cache.headObject', params);
      if (params.Key === 'cache_hit/default.jpg') {
        callback(null, {});
      } else {
        callback('error', null);
      }
    },
    getSignedUrl: function (params) {
      checkParams('S3Cache.getSignedUrl', params);
      return '[PRESIGNED S3 CACHE URL]';
    },
    upload: upload
  }
});

module.exports = {
  S3: S3,
  S3Cache: S3Cache,
  abort: abort,
  checkParams: checkParams,
  end: end,
  destroy: destroy,
  upload: upload
};
