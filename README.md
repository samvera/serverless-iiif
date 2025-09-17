# serverless-iiif

[![Build Status](https://circleci.com/gh/samvera/serverless-iiif.svg?style=svg)](https://circleci.com/gh/samvera/serverless-iiif)
[![Maintainability](https://api.codeclimate.com/v1/badges/4ac80b539190cb5b082f/maintainability)](https://codeclimate.com/github/samvera/serverless-iiif/maintainability)
[![Test Coverage](https://coveralls.io/repos/github/samvera/serverless-iiif/badge.svg)](https://coveralls.io/github/samvera/serverless-iiif)

### Breaking Changes from Version 5.x

- The `SharpLayer` variable has been removed, and the `sharp` dependency (with JP2 support) bundled into the published package. This greatly simplifies
  packaging and deployment, and removes the need for the maintainers to keep up-to-date layers deployed in every region.
- The `standalone` and `cloudfront` deployment options have been removed, per the deprecation notice in v5.x. Please see the [documented example](https://samvera.github.io/serverless-iiif/docs/quick-start/infrastructure/cloudformation#example) of how to deploy `serverless-iiif` as part of a full stack that includes a CloudFront distribution.

## Description

A IIIF [2.1](https://iiif.io/api/image/2.1/) and [3.0](https://iiif.io/api/image/3.0/) Image API compliant server written as an [AWS Serverless Application](https://aws.amazon.com/serverless/sam/).

## Components

* A simple [Lambda Function](https://aws.amazon.com/lambda/) wrapper for the [iiif-processor](https://www.npmjs.com/package/iiif-processor) module.
* A [Lambda Function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) that is used to invoke the IIIF API via HTTPS.
* A [Lambda Layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) containing all the dependencies for the Lambda Function.

## Prerequisites

* Some basic knowledge of AWS.
* An Amazon Web Services account with permissions to create IAM resources via the console and/or command line.
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

## Contributors

* [Michael B. Klein](https://github.com/mbklein)
* [Justin Gondron](https://github.com/jgondron)
* [Rob Kaufman](https://github.com/orangewolf)
* [Edward Silverton](https://github.com/edsilv)
* [Trey Pendragon](https://github.com/tpendragon)
* [Theia Wolfe](https://github.com/theiawolfe)

