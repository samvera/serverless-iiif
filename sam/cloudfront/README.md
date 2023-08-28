# serverless-iiif-cloudfront

## CloudFront Version: Deprecation Notice

This CloudFront-enabled version of the application was originally written to provide a complicated but effective way to skirt the hard 6 megabyte limit for Lambda function response payloads. Since then, AWS has introduced [AWS Lambda response streaming](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/), which uses chunked responses to bypass the 6 megabyte limit. As this is a much more elegant solution to the problem, there's nothing about the CloudFront template that's specific to this project any more. Ongoing development and maintenance will therefore focus on the IIIF Lambda itself rather than the large, complicated template required for a flexible, customizable CloudFront deployment.

The CloudFront-enabled version will remain available for the in the Serverless Application Repository for a time, mostly as a way to upgrade existing CloudFront deployments to v5.0. However, it is _strongly_ recommended that new deployments use the provided [documentation](https://samvera.github.io/serverless-iiif/docs/quick-start/infrastructure) and [examples](https://github.com/samvera/serverless-iiif/tree/main/examples) of [CloudFormation](https://aws.amazon.com/cloudformation/) templates and [Terraform](https://terraform.io/) manifests to deploy the standalone function as part of a larger application/infrastructure stack that defines its own CloudFront distribution.

### Breaking Changes from Version 4.x

- The value of the `SharpLayer` variable must now be one of `INTERNAL`, `JP2`, or a valid Lambda layer ARN in the same region the
  application is being deployed in. The new default is `JP2`, which behaves the same as the former default (empty string). The new
  value, `INTERNAL`, uses the `sharp` and `libvips` dependencies compiled into the application itself.

## Description

A IIIF [2.1](https://iiif.io/api/image/2.1/) and [3.0](https://iiif.io/api/image/3.0/) Image API compliant server written as an [AWS Serverless Application](https://aws.amazon.com/serverless/sam/).

## Components

* A simple [Lambda Function](https://aws.amazon.com/lambda/) wrapper for the [iiif-processor](https://www.npmjs.com/package/iiif-processor) module.
* A [Lambda Function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) that is used to invoke the IIIF API via HTTPS.
* A [Lambda Layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) containing all the dependencies for the Lambda Function.

## Prerequisites

* Some basic knowledge of AWS.
* An Amazon Web Services account with permissions to create resources via the console and/or command line.
* An [Amazon S3](https://aws.amazon.com/s3/) bucket to hold the source images to be served via IIIF.
  **Note: The Lambda Function will be granted read access to this bucket.**

## Quick Start via the AWS Serverless Application Repository

1. Click one of the following links to deploy the desired application from the AWS Console:
   - [Standalone (Lambda-Only) Version](https://console.aws.amazon.com/lambda/home#/create/app?applicationId=arn:aws:serverlessrepo:us-east-1:625046682746:applications/serverless-iiif-standalone)
   - [Caching (CloudFront-Enabled) Version](https://console.aws.amazon.com/lambda/home#/create/app?applicationId=arn:aws:serverlessrepo:us-east-1:625046682746:applications/serverless-iiif-cloudfront)
2. Make sure your currently selected region (in the console's top navigation bar) is the one you want to deploy to.
3. Scroll down to the **Application settings** section.
4. Configure the deploy template:
   - Give your stack a unique **Application name**
   - Enter the name of the **SourceBucket** the service will serve images from
   - Check the box acknowledging that the app will create a custom IAM roles and resource policies (and if deploying the Caching version, that it will also deploy a nested application)
   - *Optional*: Enter or change any other parameters that apply to your desired configuration.
5. Click **Deploy**.
6. When all the resources are properly created and configured, the new stack should be in the **CREATE_COMPLETE** stage. If there's an error, it will delete all the resources it created, roll back any changes it made, and eventually reach the **ROLLBACK_COMPLETE** stage.
7. Click the **CloudFormation stack** link.
8. Click the **Outputs** tab to see (and copy) the IIIF Endpoint URL.

## Deleting the application

The easiest way to delete the application is either from the [Lambda Applications Console](https://console.aws.amazon.com/lambda/home#/applications) or by deleting its [CloudFormation Stack](https://console.aws.amazon.com/cloudformation/home#/stacks?filteringStatus=active&filteringText=&viewNested=true&hideStacks=false).

## Additional Documentation and Source Code

For information on generating source images for use with `serverless-iiif` as well as advanced features, customizations, and how to contribute to the project, please refer to the [full online documentation](https://samvera.github.io/serverless-iiif) and the [GitHub repository](https://github.com/samvera/serverless-iiif).

## License

`serverless-iiif` is available under [the Apache 2.0 license](LICENSE).

## Contributors

* [Michael B. Klein](https://github.com/mbklein)
* [Justin Gondron](https://github.com/jgondron)
* [Rob Kaufman](https://github.com/orangewolf)
* [Edward Silverton](https://github.com/edsilv)
* [Trey Pendragon](https://github.com/tpendragon)
* [Theia Wolfe](https://github.com/theiawolfe)
