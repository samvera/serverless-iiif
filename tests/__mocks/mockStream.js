/* eslint-env jest */
const { Readable } = require('stream');

const destroy = jest.fn();
const end = jest.fn(() => {
  return { destroy: destroy };
});
const abort = jest.fn();
module.exports = { ...new Readable(), destroy, end, abort };
