const fs = require('fs');
const YAML = require('yaml');
const templateFile = '../sam/template.yml';
const customTags = require('./cfn-tags');

function getParameters() {
  const { Parameters } = getTemplate(templateFile);
  const result = [];
  for (const param in Parameters) {
    result.push({ Name: param, ...Parameters[param] });
  }
  return result;
}

async function getPropertyList(opts = {}) {
  opts = { descPrefix: '', ...opts };
  const { compileMdx } = await import('nextra/compile');

  const result = getParameters();
  for (const param in result) {
    const prop = result[param];
    const mdx = await compileMdx(`${opts?.descPrefix}${prop.Description}`, { defaultShowCopyCode: true });
    prop.Description = mdx.result;
  }
  return result;
}

function getTemplate(file) {
  return YAML.parse(fs.readFileSync(file).toString(), { customTags });
}

module.exports = {
  getParameters,
  getPropertyList,
  getTemplate
};
