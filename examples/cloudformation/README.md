# serverless-iiif CloudFormation Examples

This directory contains examples of how to use [CloudFormation](https://aws.amazon.com/cloudformation/) to deploy a serverless-iiif image server as part of a larger application stack. Please refer to the [CloudFormation documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) for more information on how to tailor these templates to your own needs and deploy them to AWS.

## `custom_hostname.yml`

The `custom_hostname` template will deploy a full application stack consisting of:

- A serverless-iiif image server
- A CloudFront distribution with a custom hostname and SSL certificate
