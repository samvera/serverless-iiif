/* eslint-env jest */
const AWS = require('aws-sdk');
const { streamResolver, dimensionResolver } = require('../src/resolvers');
const AWSMockS3 = require('./__mocks/mockS3');

describe('resolvers', () => {
  beforeEach(() => {
    AWS.S3 = AWSMockS3.S3;
  });

  describe('streamResolver', () => {
    it('returns a stream and cleans up', async () => {
      const callback = jest.fn(() => {});
      await streamResolver('id', callback);
      expect(callback).toHaveBeenCalled();
      expect(AWSMockS3.end).toHaveBeenCalled();
      expect(AWSMockS3.destroy).toHaveBeenCalled();
      expect(AWSMockS3.abort).toHaveBeenCalled();
    });
  });

  describe('dimensionResolver', () => {
    it('has metadata dimensions', async () => {
      const expected = {
        width: 100,
        height: 200
      };
      const result = await dimensionResolver('dimensions');
      expect(result).toEqual(expected);
    });

    it('does not have metadata dimensions', async () => {
      const expected = null;
      const result = await dimensionResolver('no-dimenstions');
      expect(result).toEqual(expected);
    });
  });
});
