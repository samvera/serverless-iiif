/* eslint-env jest */
export {};
import { handler } from '../src/index';
import callHandler from './stream-handler';

describe('service discovery document', () => {
  it('provides a links document at the root', async () => {
    const event = {
      requestContext: {
        http: {
          path: '/'
        }
      }
    };

    const { body } = await callHandler(handler, event, {});
    const info = JSON.parse(body);
    expect(info.links.length).toEqual(2);
  });
});
