const { getTemplate } = require('./cfn-reader');
const { fence, stringify } = require('./render');

function example(format) {
  const template = getTemplate('../examples/cloudformation/custom_hostname.yml');
  return fence(stringify(template, format), format);
}

function parameterList(format = 'object') {
  const { Parameters } = getTemplate('../sam/template.yml');
  for (const key in Parameters) {
    Parameters[key] = Parameters[key].Type;
  }

  const result = {
    Type: 'AWS::Serverless::Application',
    Properties: {
      Location: {
        ApplicationId:
          'arn:aws:serverlessrepo:us-east-1:625046682746:applications/serverless-iiif-standalone-dev',
        SemanticVersion: '5.0.0'
      },
      Parameters
    }
  };
  return fence(stringify(result, format), format);
}

module.exports = {
  example,
  parameterList
};
