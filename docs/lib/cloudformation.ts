import { getTemplate } from './cfn-reader';
import { fence, stringify } from './render';

export function example(format) {
  const template = getTemplate(
    '../examples/cloudformation/custom_hostname.yml'
  );
  return fence(stringify(template, format), format);
}

export function parameterList(format = 'object') {
  const { Parameters } = getTemplate('../template.yml');
  for (const key in Parameters) {
    Parameters[key] = Parameters[key].Type;
  }

  const result = {
    Type: 'AWS::Serverless::Application',
    Properties: {
      Location: {
        ApplicationId:
          'arn:aws:serverlessrepo:us-east-1:625046682746:applications/serverless-iiif-standalone-dev',
        SemanticVersion: '8.0.0'
      },
      Parameters
    }
  };
  return fence(stringify(result, format), format);
}
