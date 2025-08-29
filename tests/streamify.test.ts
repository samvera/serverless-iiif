/* eslint-env jest */
export {};
import { streamifyResponse } from '../src/streamify';
import { LambdaResponse } from '../src/contracts';
import callHandler from './stream-handler';

describe('streamifyResponse', () => {
  const context = {};
  const basePrelude = {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    isBase64Encoded: false
  };

  it('streams string bodies unchanged', async () => {
    const handler = streamifyResponse(async () => ({
      ...basePrelude,
      body: 'hello world'
    }));
    const result = await callHandler(handler, {}, context);
    expect(result.body).toBe('hello world');
    expect(result.statusCode).toBe(200);
  });

  it('streams Buffer bodies', async () => {
    const handler = streamifyResponse((async () => ({
      ...basePrelude,
      body: Buffer.from('buffered')
    })));
    const result = await callHandler(handler, {}, context);
    expect(result.body).toBe('buffered');
  });

  it('streams Uint8Array bodies', async () => {
    const handler = streamifyResponse((async () => ({
      ...basePrelude,
      body: new Uint8Array([65, 66, 67]) // ABC
    })));
    const result = await callHandler(handler, {}, context);
    expect(result.body).toBe('ABC');
  });

  it('stringifies non-string, non-binary bodies', async () => {
    const handler = streamifyResponse((async () => ({
      ...basePrelude,
      body: { a: 1 }
    } as unknown as LambdaResponse)));
    const result = await callHandler(handler, {}, context);
    // Fallback uses String(obj)
    expect(result.body).toBe('[object Object]');
  });

  it('handles undefined body as empty string', async () => {
    const handler = streamifyResponse(async () => ({
      ...basePrelude,
      body: undefined
    }));
    const result = await callHandler(handler, {}, context);
    expect(result.body).toBe('');
  });
});
