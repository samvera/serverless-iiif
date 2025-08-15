/* eslint-env jest */
export {};
import * as IIIF from 'iiif-processor';
import { handler } from '../src/index';
import * as helpers from '../src/helpers';
import callHandler from './stream-handler';

describe('index.handler /iiif/2', () => {
  const context = {};

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest
      .spyOn(helpers, "eventPath")
      .mockImplementation(() => "/iiif/3/image_id/info.json");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports an OK status', async () => {
    const event = {
      headers: {
        host: 'iiif.example.edu'
      },
      requestContext: {
        http: {
          method: 'GET',
          path: '/iiif/2'
        }
      }
    };

    const expected = { statusCode: 200, body: 'OK' };
    const result = await callHandler(handler, event, context);
    expect(result).toMatchObject(expected);
  });

  it('responds to OPTIONS REQUEST', async () => {
    const event = {
      requestContext: {
        http: {
          method: 'OPTIONS'
        }
      }
    };

    const expected = { statusCode: 204, body: '' };
    const result = await callHandler(handler, event, context);
    expect(result).toMatchObject(expected);
  });

  describe('INFO.JSON request', () => {
    beforeEach(() => {
      process.env.preflight = 'true';
    });

    afterEach(() => {
      delete process.env.preflight;
    });

    it('responds to INFO.JSON REQUEST', async () => {
      jest.spyOn(helpers, 'fileMissing').mockImplementationOnce(() => false);

      jest.spyOn(IIIF.Processor.prototype, 'execute').mockResolvedValueOnce({
        contentType: 'application/json',
        body: JSON.stringify({
          '@id': 'http://iiif.example.edu/iiif/2/image_id',
          width: 1280,
          height: 720,
          sizes: [{ w: 320, h: 180 }, { w: 640, h: 360 }, { w: 960, h: 540 }, { w: 1280, h: 720 }]
        })
      });

      const event = {
        headers: {
          host: 'iiif.example.edu',
          'x-preflight-dimensions': '{"width": 1280, "height": 720}'
        },
        requestContext: {
          http: {
            path: '/iiif/2/image_id/info.json'
          }
        }
      };

      const { body } = await callHandler(handler, event, context);
      const info = JSON.parse(body);
      expect(info['@id']).toEqual('http://iiif.example.edu/iiif/2/image_id');
      expect(info.width).toEqual(1280);
      expect(info.height).toEqual(720);
      expect(info.sizes.length).toEqual(4);
    });

    it('respects the x-forwarded-host header', async () => {
      jest.spyOn(helpers, 'fileMissing').mockImplementationOnce(() => false);

      jest.spyOn(IIIF.Processor.prototype, 'execute').mockResolvedValueOnce({
        contentType: 'application/json',
        body: JSON.stringify({
          '@id': 'https://iiif.example.edu/iiif/2/image_id',
          width: 1280,
          height: 720,
          sizes: [{ w: 320, h: 180 }, { w: 640, h: 360 }, { w: 960, h: 540 }, { w: 1280, h: 720 }]
        })
      });

      const event = {
        headers: {
          host: 'handler.behind.proxy',
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

      const { body } = await callHandler(handler, event, context);
      const info = JSON.parse(body);
      expect(info['@id']).toEqual('https://iiif.example.edu/iiif/2/image_id');
      expect(info.width).toEqual(1280);
      expect(info.height).toEqual(720);
      expect(info.sizes.length).toEqual(4);
    });

    it('redirects to INFO.JSON if filename missing', async () => {
      jest.spyOn(helpers, 'eventPath').mockImplementationOnce(() => '/iiif/2/image_id');
      jest.spyOn(helpers, 'fileMissing').mockImplementationOnce(() => true);

      const event = {};

      const expected = {
        statusCode: 302,
        headers: { Location: '/iiif/2/image_id/info.json' },
        body: 'Redirecting to info.json'
      };
      const result = await callHandler(handler, event, context);
      expect(result).toMatchObject(expected);
    });
  });

  // IMAGE REQUEST
  describe('responds to IMAGE REQUEST', () => {
    const body = '[CONTENT BODY]';
    const event = {};
    beforeEach(() => {
      jest.spyOn(helpers, 'fileMissing').mockImplementationOnce(() => false);
      jest
        .spyOn(helpers, 'getUri')
        .mockImplementationOnce(
          () => 'https://iiif.example.edu/iiif/2/image_id/full/full/0/default.jpg'
        );
    });

    it('does not use base64 encoding when streaming', async () => {
      jest
        .spyOn(IIIF.Processor.prototype, 'execute')
        .mockResolvedValue({
          body: body,
          canonicalLink:
            'https://iiif.example.edu/iiif/2/image_id/full/full/0/default.jpg',
          profileLink: 'http://iiif.io/api/image/2/level2.json'
        } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const expected = {
        statusCode: 200,
        isBase64Encoded: false,
        body: body,
        headers: {
          Link: '<https://iiif.example.edu/iiif/2/image_id/full/full/0/default.jpg>; rel=canonical,<http://iiif.io/api/image/2/level2.json>; rel=profile'
        }
      };
      const result = await callHandler(handler, event, context);
      expect(result).toMatchObject(expected);
    });

    it('handles errors that arise during processing', async () => {
      jest
        .spyOn(IIIF.Processor.prototype, 'execute')
        .mockImplementationOnce(() => {
          throw new Error('ERROR');
        });
      const expected = {
        body: 'Error: ERROR',
        headers: {
          'Content-Type': 'text.plain'
        },
        statusCode: 500
      };
      const result = await callHandler(handler, event, context);
      expect(result).toMatchObject(expected);
    });
  });
});
