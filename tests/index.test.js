/* eslint-env jest */
const IIIF = require('iiif-processor');
const { handler } = require('../src/index');
const helpers = require('../src/helpers');
const errorHandler = require('../src/error');

describe('index.handler', () => {
  let callback;
  const context = {};

  beforeEach(() => {
    jest.mock('../src/helpers');
    helpers.getRegion = jest.fn().mockImplementation(() => {
      return 'AWS REGION';
    });

    helpers.eventPath = jest.fn().mockImplementation(() => '[EVENT PATH]');
    callback = (arg1, arg2) => {
      return {
        arg1: arg1,
        arg2: arg2
      };
    };
  });

  it('responds to OPTIONS REQUEST', async () => {
    const event = {
      httpMethod: 'OPTIONS'
    };

    const expected = {
      arg1: null,
      arg2: { statusCode: 204, body: null }
    };
    const result = await handler(event, context, callback);
    expect(result).toEqual(expected);
  });

  it('responds to INFO.JSON REQUEST', async () => {
    helpers.fileMissing = jest.fn().mockImplementationOnce(() => true);

    const event = {};

    const expected = {
      arg1: null,
      arg2: { statusCode: 302, headers: { Location: '[EVENT PATH]/info.json' }, body: 'Redirecting to info.json' }
    };
    const result = await handler(event, context, callback);
    expect(result).toEqual(expected);
  });

  // IMAGE REQUEST
  describe('responds to IMAGE REQUEST', () => {
    const body = '[CONTENT BODY]';
    const event = {};
    beforeEach(() => {
      helpers.fileMissing = jest.fn().mockImplementationOnce(() => false);
      helpers.getUri = jest.fn().mockImplementationOnce(() => '[IMAGE URI]');
    });

    it('works with base64 image.', async () => {
      helpers.isBase64 = jest.fn().mockImplementationOnce(() => true);
      helpers.isTooLarge = jest.fn().mockImplementationOnce(() => false);

      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          execute: function () {
            return { body: Buffer.from(body) };
          }
        };
      });

      const expected = {
        arg1: null,
        arg2: {
          statusCode: 200,
          headers: { 'Content-Type': undefined, 'Access-Control-Allow-Origin': '*' },
          isBase64Encoded: true,
          body:  Buffer.from(body).toString('base64')
        }
      };
      const result = await handler(event, context, callback);
      expect(result).toEqual(expected);
    });

    it('works with nonbase64 image.', async () => {
      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          execute: function () {
            return { body: body };
          }
        };
      });
      helpers.isBase64 = jest.fn().mockImplementationOnce(() => false);
      helpers.isTooLarge = jest.fn().mockImplementationOnce(() => false);

      const expected = {
        arg1: null,
        arg2: {
          statusCode: 200,
          headers: { 'Content-Type': undefined, 'Access-Control-Allow-Origin': '*' },
          isBase64Encoded: false,
          body: body
        }
      };
      const result = await handler(event, context, callback);
      expect(result).toEqual(expected);
    });

    it('throws an error when file is too large.', async () => {
      helpers.isBase64 = jest.fn().mockImplementationOnce(() => false);
      helpers.isTooLarge = jest.fn().mockImplementationOnce(() => true);
      errorHandler.errorHandler = jest.fn().mockImplementationOnce(() => null);
      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          execute: function () {
            return { body: body };
          }
        };
      });
      await handler(event, context, callback);
      expect(errorHandler.errorHandler).toHaveBeenCalled();
    });
  });
});
