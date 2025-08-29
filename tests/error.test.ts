/* eslint-env jest */
export {};
import { errorHandler } from '../src/error';
import { IIIFError, Processor } from 'iiif-processor';
import mockContext from './__mocks/mockContext';
import mockEvent from './__mocks/mockEvent';

describe('errorHandler', () => {
  const event = mockEvent();
  const context = mockContext();
  let resource: Processor;

  beforeEach(() => {
    resource = new Processor("https://example.org/iiif/3/12345/info.json", () => Promise.resolve(null));
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('has a statusCode', async () => {
    const err = { name: "SomeError", message: "Error", statusCode: 404 };
    const expected = {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Not Found'
    };
    const result = await errorHandler(err, event, context, resource);
    expect(result).toEqual(expected);
  });

  it('is an instancof IIIFError', async () => {
    const err = new IIIFError('err');
    const expected = {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Error: err'
    };
    const result = await errorHandler(err, event, context, resource);
    expect(result).toEqual(expected);
  });

  it('has a fallback error', async () => {
    const err = new Error('I AM ERROR');
    const expected = {
      body: 'Error: I AM ERROR',
      headers: { 'Content-Type': 'text.plain' },
      statusCode: 500
    };
    const result = await errorHandler(err, event, context, resource);
    expect(result).toEqual(expected);
  });
});
