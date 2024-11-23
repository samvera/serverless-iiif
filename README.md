# serverless-iiif

[![Build Status](https://circleci.com/gh/samvera/serverless-iiif.svg?style=svg)](https://circleci.com/gh/samvera/serverless-iiif)
[![Maintainability](https://api.codeclimate.com/v1/badges/4ac80b539190cb5b082f/maintainability)](https://codeclimate.com/github/samvera/serverless-iiif/maintainability)
[![Test Coverage](https://coveralls.io/repos/github/samvera/serverless-iiif/badge.svg)](https://coveralls.io/github/samvera/serverless-iiif)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsamvera%2Fserverless-iiif.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsamvera%2Fserverless-iiif?ref=badge_shield)

## Upgrade Note

Previous versions of this application featured an optional [CloudFront](https://aws.amazon.com/cloudfront/) distribution that provided caching, custom domain/hostname mapping, and request/response pre/post-processing. However, the primary motivation for including this feature in the past was that it provided a complicated but effective way to skirt the hard 6 megabyte limit for Lambda function response payloads. Since then, AWS has introduced [AWS Lambda response streaming](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/), which uses chunked responses to bypass the 6 megabyte limit. As this is a much more elegant solution to the problem, there's nothing about the CloudFront template that's specific to this project any more. Ongoing development and maintenance will therefore focus on the IIIF Lambda itself rather than the large, complicated template required for a flexible, customizable CloudFront deployment.

While the CloudFront-enabled version of the application will remain available for the in the Serverless Application Repository for a time to provide an easy upgrade path for existing users, it is _strongly_ recommended that new deployments use the provided [documentation](https://samvera.github.io/serverless-iiif/docs/quick-start/infrastructure) and [examples](./examples) of [CloudFormation](https://aws.amazon.com/cloudformation/) templates and [Terraform](https://terraform.io/) manifests to deploy the standalone function as part of a larger application/infrastructure stack that defines its own CloudFront distribution.

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

## Getting Started

For information on deployment, generating source images, advanced features, and customization, see the [full online documentation](https://samvera.github.io/serverless-iiif/docs).

## Contributing

If you're working on a PR for this project, create a feature branch off of `main`.

This repository follows the [Samvera Community Code of Conduct](https://samvera.atlassian.net/wiki/spaces/samvera/pages/405212316/Code+of+Conduct) and [language recommendations](https://github.com/samvera/maintenance/blob/main/templates/CONTRIBUTING.md#language).  Please ***do not*** create a branch called `master` for this repository or as part of your pull request; the branch will either need to be removed or renamed before it can be considered for inclusion in the code base and history of this repository.

### Testing

If tests are run locally they will start in "watch" mode. If a CI environment is detected they will only run once. From the project root run:

```
npm test
```

To generate a code coverage report run:

```
npm test --coverage
```

## License

`serverless-iiif` is available under [the Apache 2.0 license](LICENSE).


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsamvera%2Fserverless-iiif.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsamvera%2Fserverless-iiif?ref=badge_large)

## Contributors

* [Michael B. Klein](https://github.com/mbklein)
* [Justin Gondron](https://github.com/jgondron)
* [Rob Kaufman](https://github.com/orangewolf)
* [Edward Silverton](https://github.com/edsilv)
* [Trey Pendragon](https://github.com/tpendragon)
* [Theia Wolfe](https://github.com/theiawolfe)