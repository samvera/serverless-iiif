const destroy = jest.fn();
const end = jest.fn(() => {
  return {
    destroy: destroy
  };
});
const abort = jest.fn();
const S3 = jest.fn().mockImplementation(() => {
  return {
    getObject: function(params) {
      return {
        createReadStream: () => {
          return {
            end: end
          }
        },
        abort: abort
      }
    },
    headObject: function(params) {
      let md = {};
      if (params['Key'] === 'dimensions.tif') {
        md = { width: '100', height: '200'};
      };
      return {
        promise: () => {
          return {
            Metadata: md
          };
        }
      };
    }
  }
});

module.exports = {
  S3: S3,
  abort: abort,
  end: end,
  destroy: destroy
};
