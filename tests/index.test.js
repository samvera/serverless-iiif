/* eslint-env jest */
const IIIF = require('iiif-processor');
const { handler } = require('../src/index');
const cache = require('../src/cache');
const helpers = require('../src/helpers');
const error = require('../src/error');
const resolvers = require('../src/resolvers');

describe('index.handler', () => {
  let callback;
  const context = {};

  beforeEach(() => {
    jest.mock('../src/helpers');
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });
  
    helpers.getRegion = jest.fn().mockImplementation(() => {
      return 'AWS REGION';
    });

    helpers.eventPath = jest.fn().mockImplementation(() => '[EVENT PATH]');
  });

  it('responds to OPTIONS REQUEST', async () => {
    const event = {
      requestContext: {
        http: {
          method: 'OPTIONS'
        }
      }
    };

    const expected = { statusCode: 204, body: null };
    const result = await handler(event, context);
    expect(result).toEqual(expected);
  });

  describe("INFO.JSON request", () => {
    beforeEach(() => {
      process.env.preflight = 'true';
    });

    afterEach(() => {
      delete process.env.preflight;
    });

    it('responds to INFO.JSON REQUEST', async () => {
      helpers.fileMissing = jest.fn().mockImplementationOnce(() => false);
  
      const event = {
        headers: {
          'host': 'iiif.example.edu',
          'x-preflight-dimensions': '{"width": 1280, "height": 720}'
        },
        requestContext: {
          http: {
            path: '/iiif/2/image_id/info.json'
          }
        }
      };

      const { body } = await handler(event, context);
      const info = JSON.parse(body);
      expect(info['@id']).toEqual('http://iiif.example.edu/iiif/2/image_id');
      expect(info.width).toEqual(1280);
      expect(info.height).toEqual(720);
      expect(info.sizes.length).toEqual(4);
    });

    it('respects the x-forwarded-host header', async () => {
      helpers.fileMissing = jest.fn().mockImplementationOnce(() => false);
  
      const event = {
        headers: {
          'host': 'handler.behind.proxy',
          'x-forwarded-host': 'iiif.example.edu',
          'x-forwarded-proto': 'https',
          'x-preflight-dimensions': '{"width": 1280, "height": 720}'
        },
        requestContext: {
          http: {
            path: '/iiif/2/image_id/info.json'
          }
        }
      };

      const { body } = await handler(event, context);
      const info = JSON.parse(body);
      expect(info['@id']).toEqual('https://iiif.example.edu/iiif/2/image_id');
      expect(info.width).toEqual(1280);
      expect(info.height).toEqual(720);
      expect(info.sizes.length).toEqual(4);
    });

    it('redirects to INFO.JSON if filename missing', async () => {
      helpers.eventPath = jest.fn().mockImplementationOnce(() => '/iiif/2/image_id');
      helpers.fileMissing = jest.fn().mockImplementationOnce(() => true);
      
      const event = {};
  
      const expected = { statusCode: 302, headers: { Location: '/iiif/2/image_id/info.json' }, body: 'Redirecting to info.json' };
      const result = await handler(event, context);
      expect(result).toEqual(expected);
    });  
  });

  // IMAGE REQUEST
  describe('responds to IMAGE REQUEST', () => {
    const body = '[CONTENT BODY]';
    const event = {};
    beforeEach(() => {
      helpers.fileMissing = jest.fn().mockImplementationOnce(() => false);
      helpers.getUri = jest.fn().mockImplementationOnce(() => 'https://iiif.example.edu/iiif/2/image_id/full/full/0/default.jpg');
    });

    it('works with base64 image.', async () => {
      cache.getCached = jest.fn().mockImplementationOnce(async () => null);
      helpers.isBase64 = jest.fn().mockImplementationOnce(() => true);
      helpers.isTooLarge = jest.fn().mockImplementationOnce(() => false);

      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          id: 'image_id',
          execute: async function () {
            return { body: Buffer.from(body) };
          }
        };
      });

      const expected = {
        statusCode: 200,
        headers: { 'Content-Type': undefined },
        isBase64Encoded: true,
        body:  Buffer.from(body).toString('base64')
      };
      const result = await handler(event, context);
      expect(result).toEqual(expected);
    });

    it('works with nonbase64 image.', async () => {
      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          id: 'image_id',
          execute: async function () {
            return { body: body };
          }
        };
      });
      cache.getCached = jest.fn().mockImplementationOnce(async () => null);
      helpers.isBase64 = jest.fn().mockImplementationOnce(() => false);
      helpers.isTooLarge = jest.fn().mockImplementationOnce(() => false);

    const expected = {
        statusCode: 200,
        headers: { 'Content-Type': undefined },
        isBase64Encoded: false,
        body: body
      };
      const result = await handler(event, context);
      expect(result).toEqual(expected);
    });

    it('returns 404 to force failover when cached file exists', async () => {
      cache.getCached = jest.fn().mockImplementationOnce(async () => '[PRESIGNED CACHE URL]');

      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          id: 'image_id',
          execute: async function () {
            return { body: body };
          }
        };
      });

      const expected = {
        statusCode: 404,
        isBase64Encoded: false,
        body: ''
      };
      const result = await handler(event, context);
      expect(result).toEqual(expected);
    });

    it('caches file and returns 404 to force failover when result is too large to return directly', async () => {
      cache.getCached = jest.fn().mockImplementationOnce(async () => null);
      cache.makeCache = jest.fn().mockImplementationOnce(async () => '[PRESIGNED CACHE URL]');
      helpers.isBase64 = jest.fn().mockImplementationOnce(() => false);
      helpers.isTooLarge = jest.fn().mockImplementationOnce(() => true);
      error.errorHandler = jest.fn().mockImplementationOnce(() => null);
      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          id: 'image_id',
          execute: async function () {
            return { body: body };
          }
        };
      });

      const expected = {
        statusCode: 404,
        isBase64Encoded: false,
        body: ''
      };
      const result = await handler(event, context);
      expect(cache.makeCache).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('handles errors that arise during processing', async () => {
      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          id: 'image_id',
          execute: async function () {
            throw new Error('ERROR');
          },
          errorClass: IIIF.IIIFError
        };
      });
      const expected = {
        body: "Error: ERROR",
        headers: {
          "Content-Type": "text.plain",
        },
        statusCode: 500,
      };
      result = await handler(event, context);
      expect(result).toEqual(expected);
    });
  });
});
