const customTags = require('./cfn-tags');
const YAML = require('yaml');

function fence(code, format) {
  return '```' + `${format}\n${code}\n` + '```';
}

function stringify(data, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'yaml':
      return YAML.stringify(data, { customTags });
    default:
      return data.toString();
  }
}

function displayValue(v) {
  if (v === '') return '""';
  if (v.join) return v.join(' | ');
  return v;
}

function present(v) {
  if (v === 0) return true;
  if (v === '') return true;
  return !!v;
}

function snake(str) {
  return str.replace(/\B([A-Z])/g, '_$1').toLowerCase();
}

module.exports = {
  displayValue,
  fence,
  present,
  snake,
  stringify
};
