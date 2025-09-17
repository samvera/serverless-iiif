/* eslint-env jest */
export {};

describe('density propagation to Processor', () => {
  const savedEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...savedEnv, tiffBucket: 'test-bucket', density: '150' } as any;
  });

  afterEach(() => {
    process.env = savedEnv;
    jest.restoreAllMocks();
  });

  it('passes density option into Processor constructor', async () => {
    jest.doMock('iiif-processor', () => {
      const Processor = jest.fn().mockImplementation((_uri: string, _sr: any, _opts: any) => ({
        execute: jest.fn().mockResolvedValue({ contentType: 'text/plain', body: 'ok' })
      }));
      return { Processor };
    });

    const helpers = await import('../src/helpers');
    jest.spyOn(helpers, 'fileMissing').mockReturnValue(false);
    jest.spyOn(helpers, 'getUri').mockReturnValue('https://example/iiif/3/id/full/max/0/default.jpg');

    const { handler } = await import('../src/index');
    const { default: callHandler } = await import('./stream-handler');

    const result = await callHandler(
      handler,
      { requestContext: { http: { path: '/iiif/3/id/full/max/0/default.jpg' } } } as any,
      {} as any
    );
    expect(result.statusCode).toBe(200);

    const iiif = await import('iiif-processor');
    const Processor: any = (iiif as any).Processor;
    expect(Processor).toHaveBeenCalled();
    const lastCall = Processor.mock.calls[Processor.mock.calls.length - 1];
    const opts = lastCall[2];
    expect(opts.density).toBe(150);
  });
});
