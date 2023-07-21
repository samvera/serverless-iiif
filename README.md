# serverless-iiif

[![Build Status](https://circleci.com/gh/samvera/serverless-iiif.svg?style=svg)](https://circleci.com/gh/samvera/serverless-iiif)
[![Maintainability](https://api.codeclimate.com/v1/badges/4ac80b539190cb5b082f/maintainability)](https://codeclimate.com/github/samvera/serverless-iiif/maintainability)
[![Test Coverage](https://coveralls.io/repos/github/samvera/serverless-iiif/badge.svg)](https://coveralls.io/github/samvera/serverless-iiif)

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

`serverless-iiif` is distributed and deployed via the [AWS Serverless Application Repository](https://aws.amazon.com/serverless/serverlessrepo/). To deploy it using the AWS Console:

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

### Deploying via the Command Line

1. Make sure you have the [SAM CLI](https://aws.amazon.com/serverless/sam/) and [AWS CLI](https://aws.amazon.com/cli/) installed.
2. Make sure the AWS CLI is [properly configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) with credentials that have sufficient access to manage IAM, S3, Lambda, and (optionally) CloudFront resources.
3. Clone this repository.
4. Copy .env.example to .env. Update the various values within.
5. Build the application:
   ```shell
   $ npm run build
   ```
6. Deploy the application:
   ```shell
   $ npm run deploy
   ```

  You'll be prompted for various configuration parameters, confirmations, and acknowledgments of specific issues (particularly the creation of IAM resources and the deployment of an open/unauthenticated Lambda Function URL).
7. Follow the prompts to complete the deployment process and get the resulting endpoint.

### Deleting the application

The easiest way to delete the application is either from the [Lambda Applications Console](https://console.aws.amazon.com/lambda/home#/applications) or by deleting its [CloudFormation Stack](https://console.aws.amazon.com/cloudformation/home#/stacks?filteringStatus=active&filteringText=&viewNested=true&hideStacks=false). If you deployed from the command line, you can also use the `npm run delete` command.

## Source Images

The S3 key of any given file, minus the extension, is its IIIF ID. For example, if you want to access the image manifest for the file at `abcdef.tif`, you would get `https://.../iiif/2/abcdef/info.json`. If your key contains slashes, they must be URL-encoded: e.g., `ab/cd/ef/gh.tif` would be at `https://.../iiif/2/ab%2Fcd%2Fef%2Fgh/info.json`. (This limitation could easily be fixed by encoding only the necessary slashes in the incoming URL before handing it off to the IIIF processor, but that's beyond the scope of the demo.)

`iiif-processor` can use any image format _natively_ supported by [libvips](https://libvips.github.io/libvips/), including JPEG 2000 (`.jp2`), but best results will come from using tiled, multi-resolution TIFFs. The Lambda Function wrapper included in this application assumes a `.tif` extension unless you set ResolverTemplate in your .env file.

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

## Custom Sharp Layer

This lambda uses the Sharp layer from https://github.com/samvera/lambda-layer-sharp-jp2/releases in order to get a version of Sharp with jp2 support. You can build your own local version using that code and then copy the file to serverless-iiif/sharp-lambda-layer.x86_64.zip. Then set LOCAL_SHARP=true and build/deploy to use your own version.

## Advanced Usage

### Cross-Origin Request Sharing (CORS)

For security reasons, web browsers have built in limits on what sort of requests can be made to a given domain from a page hosted under a different domain. Since this is a common use case for IIIF (resources embedded in pages whose domains differ from that of the server), IIIF interactions are particularly susceptible to these limits. The mechanism for determining which of these requests should be allowed or blocked is known as Cross-Origin Resource Sharing, or [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). A full explanation of CORS is beyond the scope of this project, but the SAM deploy template contains five parameters relating to how the IIIF server handles CORS:

* `CorsAllowCredentials` contains the value that will be returned in the `Access-Control-Allow-Credentials` response header.
* `CorsAllowHeaders` contains the value that will be returned in the `Access-Control-Allow-Headers` response header.
* `CorsAllowOrigin` contains the value that will be returned in the `Access-Control-Allow-Origin` response header. In addition, a special value, `REFLECT_ORIGIN`, instructs the IIIF server to copy the value of the incoming request's `Origin` header into the `Access-Control-Allow-Origin` response header.
* `CorsExposeHeaders` contains the value that will be returned in the `Access-Control-Expose-Headers` response header.
* `CorsMaxAge` contains the value that will be returned in the `Access-Control-Max-Age` response header.

The default values will work in most circumstances, but if you need the IIIF server to accept requests that include credentials or other potentially sensitive information (e.g., `Authorization` and/or `Cookie` headers), you'll need to set `CorsAllowOrigin` to `REFLECT_ORIGIN` and `CorsAllowCredentials` to `true`. Other settings allow further customization.

### Request/Response Functions

The SAM deploy template takes several optional parameters to enable the association of [CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html) or [Lambda@Edge Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html) with the CloudFront distribution. These functions can perform authentication and authorization functions, change how the S3 file and/or image dimensions are resolved, or alter the response from the lambda or cache. These parameters are:

* `OriginRequestARN`: ARN of the Lambda@Edge Function to use at the origin-request stage
* `OriginResponseARN`: ARN of the Lambda@Edge Function to use at the origin-response stage
* `ViewerRequestARN`: ARN of the CloudFront or Lambda@Edge Function to use at the viewer-request stage
* `ViewerRequestType`: Type of viewer-request Function to use (`CloudWatch Function` or `Lambda@Edge`)
* `ViewerResponseARN`: ARN of the CloudFront or Lambda@Edge Function to use at the viewer-response stage
* `ViewerResponseType`: Type of viewer-response Function to use (`CloudWatch Function` or `Lambda@Edge`)

These functions, if used, must be created, configured, and published before the serverless application is deployed.

#### Examples

These examples use CloudFront Functions. Lambda@Edge functions are slightly more complicated in terms of the event structure but the basic idea is the same.

##### Simple Authorization

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

##### Custom File Location / Image Dimensions

```JavaScript
function handler(event) {
  var request = event.request;
  request.headers['x-preflight-location'] = {value: 's3://image-bucket/path/to/correct/image.tif'};
  request.headers['x-preflight-dimensions'] = {value: JSON.stringify({ width: 640, height: 480 })};
  return request;
}
```

The `x-preflight-dimensions` header can take several shapes:

* `{ width, height }` (or `[{ width, height }]`) - a straightforward, single-resolution image
* `[{ width, height }, { width, height }, ...]` - a multi-resolution image with pages of the specified sizes
* `{ width, height, pages }` - a multi-resolution image with the specified number of `pages`, each half the size of the one before
* `{ width, height, limit }` - a multi-resolution image in which the smallest width and height are both less than the specified `limit`

For example, the following dimension values would all describe the same pyramidal image:

* `[{ width: 2048, height: 1536 }, { width: 1024, height: 768 }, { width: 512, height: 384 }]`
* `{ width: 2048, height: 1536, pages: 3 }`
* `{ width: 2048, height: 1536, limit: 480 }`

The `limit` calculator will keep going until both dimensions are _less than_ the limit, not _less than or equal to_. So a `limit: 512` on the third example above would generate a fourth page at `{ width: 256, height: 192 }`.

*Note:* The SAM deploy template adds a `preflight=true` environment variable to the main IIIF Lambda if a preflight function is provided. The function will _only_ look for the preflight headers if this environment variable is `true`. This prevents requests from including those headers directly if no preflight function is present. If you do use a preflight function, make sure it strips out any `x-preflight-location` and `x-preflight-dimensions` headers that it doesn't set itself.

## Notes

Lambda Function URLs have a payload (request/response body) size limit of approximately 6MB in both directions. To overcome this limitation, the Lambda URL is configured behind an AWS CloudFront distribution with two origins - the API and a cache bucket. Responses larger than 6MB are saved to the cache bucket at the same relative path as the request, and the Lambda returns a `404 Not Found` response to CloudFront. CloudFront then fails over to the second origin (the cache bucket), where it finds the actual response and returns it.

The cache bucket uses an S3 lifecycle rule to expire cached responses in 1 day.

## License

`serverless-iiif` is available under [the Apache 2.0 license](LICENSE).

## Contributors

* [Michael B. Klein](https://github.com/mbklein)
* [Justin Gondron](https://github.com/jgondron)
* [Rob Kaufman](https://github.com/orangewolf)
* [Edward Silverton](https://github.com/edsilv)
* [Trey Pendragon](https://github.com/tpendragon)
* [Theia Wolfe](https://github.com/theiawolfe)

## Contributing

If you're working on a PR for this project, create a feature branch off of `main`.

This repository follows the [Samvera Community Code of Conduct](https://samvera.atlassian.net/wiki/spaces/samvera/pages/405212316/Code+of+Conduct) and [language recommendations](https://github.com/samvera/maintenance/blob/main/templates/CONTRIBUTING.md#language).  Please ***do not*** create a branch called `master` for this repository or as part of your pull request; the branch will either need to be removed or renamed before it can be considered for inclusion in the code base and history of this repository.
