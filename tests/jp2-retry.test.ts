/* eslint-env jest */
export {};
import * as IIIF from 'iiif-processor';
import { ProcessorResult } from '../src/contracts';
import { handler } from '../src/index';
import * as helpers from '../src/helpers';
import callHandler from './stream-handler';

describe('JP2 oneshot retry', () => {
  const context = {};

  beforeEach(() => {
    jest.spyOn(helpers, 'fileMissing').mockReturnValue(false);
    jest.spyOn(helpers, 'getUri').mockReturnValue(
      'https://iiif.example.edu/iiif/3/image_id/full/max/0/default.jpg'
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retries when JP2 tile part error occurs once', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest
      .spyOn(IIIF.Processor.prototype, 'execute')
      .mockImplementationOnce(() => {
        throw new Error('Invalid tile part index');
      })
      .mockResolvedValueOnce({
        body: 'RENDERED',
        contentType: 'image/jpeg'
      } as ProcessorResult);

    const result = await callHandler(handler, {}, context);
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('RENDERED');
    expect(logSpy).toHaveBeenCalledWith(
      'Encountered JP2 tile part index error. Trying oneshot load.'
    );
  });
});

