/* eslint-env jest */
const { handler } = require('../src/index');
const callHandler = require('./stream-handler');
const helpers = require('../src/helpers');

describe('service discovery document', () => {
  beforeEach(() => {
    jest.mock('../src/helpers');
    helpers.getRegion = jest.fn().mockImplementation(() => {
      return 'AWS REGION';
    });
  });

  it('provides a links document at the root', async () => {
      const event = {
        requestContext: {
          http: {
            path: '/',
          },
        },
      };

      const { body } = await callHandler(handler, event, {});
      const info = JSON.parse(body);
      expect(info.links.length).toEqual(2);
  });
});