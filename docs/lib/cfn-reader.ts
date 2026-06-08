import fs from 'fs';
import YAML from 'yaml';
import customTags from './cfn-tags';

const templateFile = '../template.yml';

export function getParameters() {
  const { Parameters } = getTemplate(templateFile);
  const result = [];
  for (const param in Parameters) {
    result.push({ Name: param, ...Parameters[param] });
  }
  return result;
}

export async function getPropertyList(opts = {}) {
  opts = { descPrefix: '', ...opts };
  const { compileMdx } = await import('nextra/compile');

  const result = getParameters();
  for (const param in result) {
    const prop = result[param];
    const mdx = await compileMdx(`${opts?.descPrefix}${prop.Description}`, {
      defaultShowCopyCode: true
    });
    prop.Description = mdx.result;
  }
  return result;
}

export function getTemplate(file) {
  const yaml = fs.readFileSync(file).toString();
  return YAML.parse(yaml, { customTags });
}
