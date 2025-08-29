import { LambdaEvent, LambdaResponse, LambdaContext } from './contracts';
import { IIIFError, Processor } from 'iiif-processor';

export const errorHandler = async (
  err: Error & { statusCode?: number },
  _event: LambdaEvent,
  _context: LambdaContext,
  resource?: Processor
): Promise<LambdaResponse> => {
  if (err?.statusCode) {
    return {
      statusCode: err.statusCode,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Not Found'
    };
  } else if (resource !== undefined && err instanceof IIIFError) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: String(err)
    };
  } else {
     
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text.plain' },
      body: String(err)
    };
  }
};
