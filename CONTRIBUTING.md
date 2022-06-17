# Contributing

This document describes how to deploy to a development environment and submit your contributions.

## Prerequisites

- Some basic knowledge of AWS and [CloudFormation](https://aws.amazon.com/cloudformation/)
- Requires the [SAM CLI](https://aws.amazon.com/serverless/sam/) and [AWS CLI](https://aws.amazon.com/cli/)
- Building dependencies with the correct architecture requires [Docker](https://docs.docker.com/get-docker/).

## Deploy

The following instructions require you to `cd` into the correct directory for whichever flavor of the template you're using - `sam/standalone` for the Lambda-only version, or `sam/cloudfront` for the CloudFront-enabled version.

For iterative development, you may want to use [SAM Accelerate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/accelerate.html) to keep the deployed stack in sync with local changes automatically.

### Using SAM

The easiest way to deploy is using the SAM guided command:

```sh
sam build --use-container
sam deploy --guided
```

If successful, make note of the `Endpoint - IIIF Endpoint URL` output. You'll need this to test the API.

## Test the API

To test the API, you'll need an identifier that exists in your source bucket. Make a request for that identifier with:

`<myapiendpoint>/<myimageidentifier>/full/full/0/default.jpg`

Replace `<myapiendpoint>` with the `Endpoint` output from the `sam deploy` command.

## Pull Request

Once you've completed your changes and confirmed that they are working:

1. Push to a GitHub fork.
1. Submit a Pull Request on GitHub. Your changes will be reviewed by one of the maintainers.
