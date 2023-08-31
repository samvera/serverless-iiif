/* eslint-env jest */
require('aws-sdk-client-mock-jest');
const { mockClient } = require('aws-sdk-client-mock');
const { S3Client, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const mockStream = require('./__mocks/mockStream');
const resolvers = require('../src/resolvers');

describe('resolvers', () => { // eslint-disable-line max-lines-per-function
  let s3Mock;

  beforeEach(() => {
    s3Mock = mockClient(S3Client);
    s3Mock.on(GetObjectCommand).resolves({ Body: mockStream });
    s3Mock
      .on(HeadObjectCommand).resolves({ Metadata: { } })
      .on(HeadObjectCommand, { Key: 'dimensions.tif' }).resolves({ Metadata: { width: '2048', height: '1536' } })
      .on(HeadObjectCommand, { Key: 'paged-dimensions.tif' }).resolves({ Metadata: { width: '2048', height: '1536', pages: '5' } });
  });

  describe('default resolvers', () => {
    const { streamResolver, dimensionResolver } = resolvers.resolverFactory({ headers: {} }, false);
    describe('streamResolver', () => {
      const callback = jest.fn(() => {});

      it('returns a stream and cleans up', async () => {
        await streamResolver({id: 'id'}, callback);
        expect(callback).toHaveBeenCalled();
        expect(s3Mock).toHaveReceivedCommand(GetObjectCommand);
      });

      describe('resolverTemplate', () => {
        beforeEach(() => {
          process.env.resolverTemplate = '/path/to/%s/%s-pyramid.tiff';
        });

        afterEach(() => {
          delete process.env.resolverTemplate;
        });

        it('uses the resolverTemplate, if present', async () => {
          await streamResolver({id: 'id'}, callback);
          expect(s3Mock)
            .toHaveReceivedCommandWith(GetObjectCommand, { Bucket: 'test-bucket', Key: '/path/to/id/id-pyramid.tiff' });
        });  
      });
    });

    describe('dimensionResolver', () => {
      it('has metadata dimensions', async () => {
        const expected = [{ width: 2048, height: 1536 }];
        const result = await dimensionResolver({id: 'dimensions'});
        expect(result).toEqual(expected);
      });

      it('calculates pyramid info if metadata has pages', async () => {
        const expected = [
          { width: 2048, height: 1536 },
          { width: 1024, height: 768 },
          { width: 512, height: 384 },
          { width: 256, height: 192 },
          { width: 128, height: 96 }
        ];
        const result = await dimensionResolver({id: 'paged-dimensions'});
        expect(s3Mock).toHaveReceivedCommandWith(HeadObjectCommand, {
          Bucket: "test-bucket",
          Key: "paged-dimensions.tif",
        });
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
    let savedEnvironment;

    beforeEach(() => {
      savedEnvironment = { ...process.env };
    });

    afterEach(() => {
      process.env = { ...savedEnvironment };
    });

    describe('streamResolver', () => {
      const { streamResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-location': 's3://test-bucket/dimensions.tif' } }, true);
      it('returns a stream and cleans up', async () => {
        const callback = jest.fn(() => {});
        await streamResolver({id: 'id'}, callback);
        expect(callback).toHaveBeenCalled();
        // expect(AWSMockS3.end).toHaveBeenCalled();
        // expect(AWSMockS3.destroy).toHaveBeenCalled();
        // expect(AWSMockS3.abort).toHaveBeenCalled();
      });
    });

    describe('dimensionResolver', () => {
      it('preflight dimensions (single)', async () => {
        const { dimensionResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-dimensions': '{ "width": 640, "height": 480 }' } }, true);
        const expected = { width: 640, height: 480 };
        const result = await dimensionResolver({id: 'dimensions'});
        expect(result).toEqual(expected);
      });

      it('preflight dimensions (array)', async () => {
        const { dimensionResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-dimensions': '[{ "width": 640, "height": 480 }]' } }, true);
        const expected = [{ width: 640, height: 480 }];
        const result = await dimensionResolver({id: 'dimensions'});
        expect(result).toEqual(expected);
      });

      it('preflight dimensions (pages)', async () => {
        const { dimensionResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-dimensions': '{ "width": 640, "height": 480, "pages": 2 }' } }, true);
        const expected = [
          { width: 640, height: 480 },
          { width: 320, height: 240 }
        ];
        const result = await dimensionResolver({id: 'dimensions'});
        expect(result).toEqual(expected);
      });

      it('preflight dimensions (pages)', async () => {
        const { dimensionResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-dimensions': '{ "width": 640, "height": 480, "limit": 200 }' } }, true);
        const expected = [
          { width: 640, height: 480 },
          { width: 320, height: 240 },
          { width: 160, height: 120 }
        ];
        const result = await dimensionResolver({id: 'dimensions'});
        expect(result).toEqual(expected);
      });

      it('no preflight dimensions / metadata dimensions', async () => {
        const { dimensionResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-location': 's3://test-bucket/dimensions.tif' } }, true);
        const expected = [{ width: 2048, height: 1536 }];
        const result = await dimensionResolver({id: 'dimensions'});
        expect(result).toEqual(expected);
      });

      it('no preflight dimensions / metadata dimensions / page size limit', async () => {
        process.env.pyramidLimit = "256";
        const { dimensionResolver } = resolvers.resolverFactory({ headers: { 'x-preflight-location': 's3://test-bucket/dimensions.tif' } }, true);
        const expected = [
          { width: 2048, height: 1536 },
          { width: 1024, height: 768 },
          { width: 512, height: 384 },
          { width: 256, height: 192 },
          { width: 128, height: 96 },
        ];
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
  })
});
