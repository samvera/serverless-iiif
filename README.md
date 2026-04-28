# serverless-iiif

[![Build Status](https://github.com/samvera/serverless-iiif/actions/workflows/build.yml/badge.svg)](https://github.com/samvera/serverless-iiif/actions/workflows/build.yml) [![Test Coverage](https://coveralls.io/repos/github/samvera/serverless-iiif/badge.svg)](https://coveralls.io/github/samvera/serverless-iiif)

> [!IMPORTANT]
> ### Breaking Changes from Version 7.x
> 
> - The [image metadata](https://samvera.github.io/serverless-iiif/docs/source-images#image-metadata) requirements have changed. Existing
>   metadata will continue to work, but with no `pages` property, the service will assume source images are single resolution and operate
>   less efficiently. This tradeoff was required to clear up ambiguity and prevent the service from making incorrect assumptions about
>   the properties of source images. Image metadata also now supports `tilewidth`, `tileheight` and `tilesize` properties to prevent the
>   service from having to probe the image for tile information.
> - The [`x-preflight-dimensions`](https://samvera.github.io/serverless-iiif/docs/advanced-usage/request-response-functions#custom-file-location--image-dimensions)
>   preflight header has new requirements to match the above changes.
> 
> The repository also includes two new command-line utilities. See [Components](#components) below for details

## Description

A IIIF [2.1](https://iiif.io/api/image/2.1/) and [3.0](https://iiif.io/api/image/3.0/) Image API compliant server written as an [AWS Serverless Application](https://aws.amazon.com/serverless/sam/).

## Components

* A simple [Lambda Function](https://aws.amazon.com/lambda/) wrapper for the [iiif-processor](https://www.npmjs.com/package/iiif-processor) module.
* A [Lambda Function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) that is used to invoke the IIIF API via HTTPS.
* A [Lambda Layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) containing all the dependencies for the Lambda Function.
* Two utility scripts:
  - [create-tiled-tiff](create-tiled-tiff.md) generates a tiled, multi-resolution TIFF from an AWS S3 image object and writes it to another AWS S3 object
  - [create-metadata](create-metadata.md) probes an existing AWS S3 image object for IIIF geometry metadata and adds the metadata to the S3 object

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

