/* eslint-env jest */
const { errorHandler } = require('../src/error');
const resource = require('./__mocks/mockResource');

describe('errorHandler', () => {
  const event = {};
  const context = {};

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  it('has a statusCode', async () => {
    const err = { statusCode: 404 };
    const resource = {};
    const expected = {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Not Found'
    };
    const result = await errorHandler(err, event, context, resource);
    expect(result).toEqual(expected);
  });

  it('is an instancof errorClass', async () => {
    // eslint-disable-next-line new-cap
    const err = new resource.errorClass('err');
    const expected = {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'err'
    };
    const result = await errorHandler(err, event, context, resource);
    expect(result).toEqual(expected);
  });

  it('has a fallback error', async () => {
    const err = new Error('I AM ERROR');
    const expected = {"body": "Error: I AM ERROR", "headers": {"Content-Type": "text.plain"}, "statusCode": 500};
    const result = await errorHandler(err, event, context, resource);
    expect(result).toEqual(expected);
  });
});
