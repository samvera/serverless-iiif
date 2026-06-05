import customTags from './cfn-tags';
import YAML from 'yaml';

export function fence(code, format) {
  return '```' + `${format}\n${code}\n` + '```';
}

export function stringify(data, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'yaml':
      return YAML.stringify(data, { customTags });
    default:
      return data.toString();
  }
}

export function displayValue(v) {
  if (v === '') return '""';
  if (v.join) return v.join(' | ');
  return v;
}

export function present(v) {
  if (v === 0) return true;
  if (v === '') return true;
  if (v === false) return true;
  return !!v;
}

export function snake(str) {
  return str.replace(/\B([A-Z])/g, '_$1').toLowerCase();
}
