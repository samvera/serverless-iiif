/* eslint-env jest */
export {};
import { addCorsHeaders, eventPath, fileMissing, getUri } from '../src/helpers';
import mockEvent from './__mocks/mockEvent';

describe('helper functions', () => {
  describe('addCorsHeaders', () => {
    afterEach(() => {
      delete process.env.corsAllowCredentials;
      delete process.env.corsAllowOrigin;
      delete process.env.corsAllowHeaders;
      delete process.env.corsExposeHeaders;
      delete process.env.corsMaxAge;
    });

    it('uses default values for CORS headers', () => {
      const { headers } = addCorsHeaders(mockEvent(), {});
      const expected = {
        'Access-Control-Allow-Credentials': 'false',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': 'cache-control,content-language,content-length,content-type,date,expires,last-modified,pragma',
        'Access-Control-Max-Age': '3600'
      };

      expect(headers).toMatchObject(expected);
    });

    it('uses configured values for CORS headers', () => {
      process.env = {
        ...process.env,
        corsAllowCredentials: 'ExpectedAllowCredentials',
        corsAllowOrigin: 'ExpectedAllowOrigin',
        corsAllowHeaders: 'ExpectedAllowHeaders',
        corsExposeHeaders: 'ExpectedExposeHeaders',
        corsMaxAge: 'ExpectedMaxAge'
      };

      const { headers } = addCorsHeaders(mockEvent(), {});
      const expected = {
        'Access-Control-Allow-Credentials': 'ExpectedAllowCredentials',
        'Access-Control-Allow-Origin': 'ExpectedAllowOrigin',
        'Access-Control-Allow-Headers': 'ExpectedAllowHeaders',
        'Access-Control-Expose-Headers': 'ExpectedExposeHeaders',
        'Access-Control-Max-Age': 'ExpectedMaxAge'
      };
      expect(headers).toMatchObject(expected);
    });

    it('reflects the Origin request header when specified', () => {
      process.env.corsAllowOrigin = 'REFLECT_ORIGIN';

      const event = mockEvent({
        headers: { origin: 'https://iiif-client.example.edu/' }
      });
      const { headers } = addCorsHeaders(event, {});
      const expected = {
        'Access-Control-Allow-Credentials': 'false',
        'Access-Control-Allow-Origin': 'https://iiif-client.example.edu/',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': 'cache-control,content-language,content-length,content-type,date,expires,last-modified,pragma',
        'Access-Control-Max-Age': '3600'
      };

      expect(headers).toMatchObject(expected);
    });
  });

  describe('eventPath', () => {
    it('retrieves the path from the event', () => {
      const event = mockEvent({
        headers: { host: 'host' },
        requestContext: { http: { path: '/path/' } }
      });
      expect(eventPath(event)).toEqual('/path');
    });
  });

  describe('fileMissing', () => {
    it('has a missing file', () => {
      const event = mockEvent({
        requestContext: { http: { path: 'http://path' } }
      });
      expect(fileMissing(event)).toEqual(true);
    });
    it('does not have a missing file', () => {
      const event = mockEvent({
        requestContext: { http: { path: 'http://path/file.json' } }
      });
      expect(fileMissing(event)).toEqual(false);
    });
  });

  describe('getUri', () => {
    afterEach(() => {
      delete process.env.forceHost;
    });
    it('has X-Forwarded headers', () => {
      const event = mockEvent({
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'forward-host',
          host: 'host'
        },
        requestContext: { http: { path: '/path' } }
      });
      expect(getUri(event)).toEqual('https://forward-host/path');
    });
    it('does not have X-Forwarded headers', () => {
      const event = mockEvent({
        headers: {
          host: 'host'
        },
        requestContext: { http: { path: '/path' } }
      });
      expect(getUri(event)).toEqual('http://host/path');
    });
    it('respects forceHost setting', () => {
      process.env.forceHost = 'forced-host';
      const event = mockEvent({
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'forward-host',
          host: 'host'
        },
        requestContext: { http: { path: '/path' } }
      });
      expect(getUri(event)).toEqual('https://forced-host/path');
    });
  });
});
