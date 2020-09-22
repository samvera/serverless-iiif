const { errorHandler } = require('../src/error');
const resource = require('./__mocks/mockResource');

describe('errorHandler', () => {
  const event = {};
  const context = {};

  const callback = (arg1, arg2) => {
    return {
      arg1: arg1,
      arg2: arg2
    }
  };

  beforeEach(() => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation((arg1, arg2) => {
      return {
        arg1: arg1,
        arg2: arg2
      }
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  })
  it('has a statusCode', async () => {
    const err = { statusCode: 404};
    const resource = {};
    const expected = {
      arg1: null,
      arg2: {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Not Found'
      }
    };
    const result = await errorHandler(err, event, context, resource, callback);
    expect(result).toEqual(expected);
  });

  it('is an instancof errorClass', async() => {
    const err = new resource.errorClass('err');
    const expected = {
      arg1: null,
      arg2: {
        statusCode: 400,
        headers: { 'Content-Type': 'text/plain' },
        body: 'err'
      }
    };
    const result = await errorHandler(err, event, context, resource, callback);
    expect(result).toEqual(expected);
  });

  it('has a fallback error', async () => {
    const err = new Error('I AM ERROR');
    const expected = {
      arg1: err,
      arg2: null
    };
    const result = await errorHandler(err, event, context, resource, callback);
    expect(result).toEqual(expected);
  });
})
