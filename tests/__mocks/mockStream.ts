/* eslint-env jest */
import { Readable } from 'stream';

const destroy = jest.fn();
const end = jest.fn(() => {
  return { destroy: destroy };
});
const abort = jest.fn();
export default { ...(new Readable()), destroy, end, abort };

