/* eslint-env jest */
const AWS = require('aws-sdk');
const resolvers = require('../src/resolvers');
const AWSMockS3 = require('./__mocks/mockS3');

describe('default resolvers', () => { // eslint-disable-line max-lines-per-function
  const { streamResolver, dimensionResolver } = resolvers.resolverFactory({ headers: {} }, false);

  beforeEach(() => {
    AWS.S3 = AWSMockS3.S3;
  });

  describe('streamResolver', () => {
    it('returns a stream and cleans up', async () => {
      const callback = jest.fn(() => {});
      await streamResolver({id: 'id'}, callback);
      expect(callback).toHaveBeenCalled();
      expect(AWSMockS3.end).toHaveBeenCalled();
      expect(AWSMockS3.destroy).toHaveBeenCalled();
      expect(AWSMockS3.abort).toHaveBeenCalled();
    });
  });

  describe('dimensionResolver', () => {
    it('has metadata dimensions', async () => {
      const expected = { width: 100, height: 200 };
      const result = await dimensionResolver({id: 'dimensions'});
      expect(result).toEqual(expected);
    });

    it('does not have metadata dimensions', async () => {
      const expected = null;
      const result = await dimensionResolver({id: 'no-dimensions'});
      expect(result).toEqual(expected);
    });
  });
});

describe('preflight resolvers', () => { // eslint-disable-line max-lines-per-function
  beforeEach(() => {
    AWS.S3 = AWSMockS3.S3;
  });

  describe('streamResolver', () => {
    const { streamResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-location': 's3://test-bucket/dimensions.tif' } }, true);
    it('returns a stream and cleans up', async () => {
      const callback = jest.fn(() => {});
      await streamResolver({id: 'id'}, callback);
      expect(callback).toHaveBeenCalled();
      expect(AWSMockS3.end).toHaveBeenCalled();
      expect(AWSMockS3.destroy).toHaveBeenCalled();
      expect(AWSMockS3.abort).toHaveBeenCalled();
    });
  });

  describe('dimensionResolver', () => {
    it('preflight dimensions', async () => {
      const { dimensionResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-dimensions': '{ "width": 640, "height": 480 }' } }, true);
      const expected = { width: 640, height: 480 };
      const result = await dimensionResolver({id: 'dimensions'});
      expect(result).toEqual(expected);
    });

    it('no preflight dimensions / metadata dimensions', async () => {
      const { dimensionResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-location': 's3://test-bucket/dimensions.tif' } }, true);
      const expected = { width: 100, height: 200 };
      const result = await dimensionResolver({id: 'dimensions'});
      expect(result).toEqual(expected);
    });

    it('no preflight dimensions / no metadata dimensions', async () => {
      const { dimensionResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-location': 's3://test-bucket/no-dimensions.tif' } }, true);
      const expected = null;
      const result = await dimensionResolver({id: 'no-dimensions'});
      expect(result).toEqual(expected);
    });
  });
});
