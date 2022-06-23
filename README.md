# serverless-iiif

[![Build Status](https://circleci.com/gh/samvera-labs/serverless-iiif.svg?style=svg)](https://circleci.com/gh/samvera-labs/serverless-iiif)
[![Maintainability](https://api.codeclimate.com/v1/badges/e23260bc07851b4f8db5/maintainability)](https://codeclimate.com/github/samvera-labs/serverless-iiif/maintainability)
[![Test Coverage](https://coveralls.io/repos/github/samvera-labs/serverless-iiif/badge.svg)](https://coveralls.io/github/samvera-labs/serverless-iiif)

## Description

A [IIIF 2.1 Image API](https://iiif.io/api/image/2.1/) compliant server written as an [AWS Serverless Application](https://aws.amazon.com/serverless/sam/).

## Components

* A simple [Lambda Function](https://aws.amazon.com/lambda/) wrapper for the [iiif-processor](https://www.npmjs.com/package/iiif-processor) module.
* A [Lambda Function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) that is used to invoke the IIIF API via HTTPS.
* A [Lambda Layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) containing all the dependencies for the Lambda Function.
* An optional [CloudFormation](https://aws.amazon.com/cloudformation/) template describing the resources needed to deploy the application.

## Prerequisites

* Some basic knowledge of AWS.
* An Amazon Web Services account with permissions to create resources via the console and/or command line.
* An [Amazon S3](https://aws.amazon.com/s3/) bucket to hold the source images to be served via IIIF.
  **Note: The Lambda Function will be granted read access to this bucket.**

## Quick Start

`serverless-iiif` comes in two flavors: *Standalone (Lambda-only)* and *Caching (CloudFront-enabled)*. The Standalone version is much simpler, but lacks the following features:

- Custom Domain Name
  - Standalone URLs are in the `lambda-url.AWS_REGION.on.aws` domain (e.g., `https://fu90293j0pj902j902c32j902.lambda-url.us-east-1.on.aws/iiif/2/`)
  - Caching URLs *without* Custom Domains are in the `cloudfront.net` domain (e.g., `https://d3kmjdzzy1l5t3.cloudfront.net/iiif/2/`)
- Responses larger than ~6MB
- CloudFront function support (for pre/post-processing requests and responses)

### Deploying via the AWS Serverless Application Repository

**Note: AWS Serverless Application Repository hasn't yet rolled out support for application templates containing Lambda Function URLs, so the following instructions will deploy the older, monolithic version of `serverless-iiif` with an API Gateway instead of the Lambda Function URL.**

`serverless-iiif` is distributed and deployed via the [AWS Serverless Application Repository](https://aws.amazon.com/serverless/serverlessrepo/). To deploy it using the AWS Console:

1. Click to 👉 [Deploy the Serverless Application](https://console.aws.amazon.com/lambda/home#/create/app?applicationId=arn:aws:serverlessrepo:us-east-1:625046682746:applications/serverless-iiif) 👈 from the AWS Console.
2. Make sure your currently selected region (in the console's top navigation bar) is the one you want to deploy to.
3. Scroll down to the **Application settings** section.
4. Give your stack a unique name, enter the name of the image bucket, and check the box acknowledging that the
   app will create an IAM execution role for itself.
5. Click **Deploy**.
6. When all the resources are properly created and configured, the new stack should be in the **CREATE_COMPLETE** stage. If there's an error, it will delete all the resources it created, roll back any changes it made, and eventually reach the **ROLLBACK_COMPLETE** stage.
7. Click the **CloudFormation stack** link.
8. Click the **Outputs** tab to see (and copy) the IIIF Endpoint URL.

### Deploying via the Command Line

1. Make sure you have the [SAM CLI](https://aws.amazon.com/serverless/sam/) and [AWS CLI](https://aws.amazon.com/cli/) installed.
2. Make sure the AWS CLI is [properly configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) with credentials that have sufficient access to manage IAM, S3, Lambda, and (optionally) CloudFront resources.
3. Clone this repository.
4. Open a shell in the working copy's `sam/standalone` or `sam/cloudfront` directory, depending on which flavor you would like to install.
5. Build the application:
   ```shell
   $ sam build --use-container
   ```
6. Deploy the application:
   ```shell
   $ sam deploy --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND --guided
   ```
   (Note: You may have to use the `--profile PROFILE_NAME` argument if using an AWS CLI profile other than the default)

   You'll be prompted for various configuration parameters, confirmations, and acknowledgments of specific issues (particularly the creation of IAM resources and the deployment of an open/unauthenticated Lambda Function URL).
7. Follow the prompts to complete the deployment process and get the resulting endpoint.

### Deleting the application

The easiest way to delete the application is either from the [Lambda Applications Console](https://console.aws.amazon.com/lambda/home#/applications) or by deleting its [CloudFormation Stack](https://console.aws.amazon.com/cloudformation/home#/stacks?filteringStatus=active&filteringText=&viewNested=true&hideStacks=false). If you deployed from the command line, you can also use the `sam delete` command.

## Source Images

The S3 key of any given file, minus the extension, is its IIIF ID. For example, if you want to access the image manifest for the file at `abcdef.tif`, you would get `https://.../iiif/2/abcdef/info.json`. If your key contains slashes, they must be URL-encoded: e.g., `ab/cd/ef/gh.tif` would be at `https://.../iiif/2/ab%2Fcd%2Fef%2Fgh/info.json`. (This limitation could easily be fixed by encoding only the necessary slashes in the incoming URL before handing it off to the IIIF processor, but that's beyond the scope of the demo.)

`iiif-processor` can use any image format _natively_ supported by [libvips](https://libvips.github.io/libvips/), but best results will come from using tiled, multi-resolution TIFFs. The Lambda Function wrapper included in this application assumes a `.tif` extension.

### Creating tiled TIFFs

#### Using VIPS

    vips tiffsave source_image.tif output_image.tif --tile --pyramid --compression jpeg --tile-width 256 --tile-height 256

#### Using ImageMagick

    convert source_image.tif -define tiff:tile-geometry=256x256 -compress jpeg 'ptif:output_image.tif'

## Testing

If tests are run locally they will start in "watch" mode. If a CI environment is detected they will only run once. From the project root run:

```
npm test
```

To generate a code coverage report run:

```
npm test --coverage
```

## Advanced Usage

The SAM deploy template takes several optional parameters to enable the association of [CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html) or [Lambda@Edge Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html) with the CloudFront distribution. These functions can perform authentication and authorization functions, change how the S3 file and/or image dimensions are resolved, or alter the response from the lambda or cache. These parameters are:

* `OriginRequestARN`: ARN of the Lambda@Edge Function to use at the origin-request stage
* `OriginResponseARN`: ARN of the Lambda@Edge Function to use at the origin-response stage
* `ViewerRequestARN`: ARN of the CloudFront or Lambda@Edge Function to use at the viewer-request stage
* `ViewerRequestType`: Type of viewer-request Function to use (`CloudWatch Function` or `Lambda@Edge`)
* `ViewerResponseARN`: ARN of the CloudFront or Lambda@Edge Function to use at the viewer-response stage
* `ViewerResponseType`: Type of viewer-response Function to use (`CloudWatch Function` or `Lambda@Edge`)

These functions, if used, must be created, configured, and published before the serverless application is deployed.

### Examples

These examples use CloudFront Functions. Lambda@Edge functions are slightly more complicated in terms of the event structure but the basic idea is the same.

#### Simple Authorization

```JavaScript
function handler(event) {
    if (notAuthorized) { // based on something in the event.request
       return {
         statusCode: 403,
         statusDescription: 'Unauthorized'
       };
    };
    return event.request;
}
```

#### Custom File Location / Image Dimensions

```JavaScript
function handler(event) {
  var request = event.request;
  request.headers['x-preflight-location'] = {value: 's3://image-bucket/path/to/correct/image.tif'};
  request.headers['x-preflight-dimensions'] = {value: JSON.stringify({ width: 640, height: 480 })};
  return request;
}
```

*Note:* The SAM deploy template adds a `preflight=true` environment variable to the main IIIF Lambda if a preflight function is provided. The function will _only_ look for the preflight headers if this environment variable is `true`. This prevents requests from including those headers directly if no preflight function is present. If you do use a preflight function, make sure it strips out any `x-preflight-location` and `x-preflight-dimensions` headers that it doesn't set itself.

## Notes

Lambda Function URLs have a payload (request/response body) size limit of approximately 6MB in both directions. To overcome this limitation, the Lambda URL is configured behind an AWS CloudFront distribution with two origins - the API and a cache bucket. Responses larger than 6MB are saved to the cache bucket at the same relative path as the request, and the Lambda returns a `404 Not Found` response to CloudFront. CloudFront then fails over to the second origin (the cache bucket), where it finds the actual response and returns it.

The cache bucket uses an S3 lifecycle rule to expire cached responses in 1 day.

## License

`serverless-iiif` is available under [the Apache 2.0 license](LICENSE).

## Contributors

* [Michael B. Klein](https://github.com/mbklein)
* [Justin Gondron](https://github.com/jgondron)
* [Edward Silverton](https://github.com/edsilv)
* [Trey Pendragon](https://github.com/tpendragon)
* [Dan Wolfe](https://github.com/danthewolfe)

## Contributing

If you're working on a PR for this project, create a feature branch off of `main`.

This repository follows the [Samvera Community Code of Conduct](https://samvera.atlassian.net/wiki/spaces/samvera/pages/405212316/Code+of+Conduct) and [language recommendations](https://github.com/samvera/maintenance/blob/main/templates/CONTRIBUTING.md#language).  Please ***do not*** create a branch called `master` for this repository or as part of your pull request; the branch will either need to be removed or renamed before it can be considered for inclusion in the code base and history of this repository.
