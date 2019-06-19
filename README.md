# serverless-iiif

## Description

A [IIIF 2.1 Image API](https://iiif.io/api/image/2.1/) compliant server written as an [AWS Serverless Application](https://aws.amazon.com/serverless/sam/).

## Components

* A simple [Lambda Function](https://aws.amazon.com/lambda/) wrapper for the [iiif-processor](https://www.npmjs.com/package/iiif-processor) module.
* A [Lambda Layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) containing all the dependencies for the Lambda Function.
* An [API Gateway](https://aws.amazon.com/api-gateway/) interface for the Lambda Function.
* A [CloudFormation](https://aws.amazon.com/cloudformation/) template describing the resources needed to deploy the application.

## Prerequisites

* Some basic knowledge of AWS.
* An Amazon Web Services account with permissions to create resources via the console and/or command line.
* An [Amazon S3](https://aws.amazon.com/s3/) bucket to hold the source images to be served via IIIF.
  **Note: The Lambda Function will be granted read access to this bucket.**

## Quick Start

There are two ways to install the serverless IIIF application: From the AWS Console, and from the
Command Line

### AWS Console

1. Click to 👉 [Launch the CloudFormation Stack](https://console.aws.amazon.com/cloudformation/home?#/stacks/new?templateURL=https://nul-public.s3.amazonaws.com/serverless-iiif/deploy.yaml) 👈 from the AWS Console.
2. Click **Next**.
3. Give your stack a unique name, enter the name of the image bucket, and click **Next**.
4. Don't bother with anything on the **Configure stack options** page unless you're confident
   that you know what you're doing. The defaults work just fine. Click **Next**.
5. Scroll to the bottom of the **Review** page, read and acknowledge the **Capabilities and transforms** section, and click **Create Stack**.
6. When all the resources are properly created and configured, the new stack should be in the **CREATE_COMPLETE** stage. If there's an error, it will delete all the resources it created, roll back any changes it made, and eventually reach the **ROLLBACK_COMPLETE** stage.
7. Select the Stack and click the **Outputs** tab to see (and copy) the IIIF Endpoint URL.

### Command Line

1. Install and configure the [AWS Command Line Tools](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html).
2. Execute the following command, replacing `$IMAGE_BUCKET` with the name of the image bucket
   and `$STACK_NAME` with a unique name for your stack:

        aws cloudformation create-stack \
          --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
          --template-url https://nul-public.s3.amazonaws.com/serverless-iiif/deploy.yaml \
          --parameters ParameterKey=SourceBucket,ParameterValue=$IMAGE_BUCKET \
          --stack-name $STACK_NAME

3. If you're feeling really devoted to the command line, you can run

        aws cloudformation describe-stacks --stack-name $STACK_NAME

   repeatedly until the stack reaches the `CREATE_COMPLETE` stage and displays
   the IIIF Endpoint in the `Outputs` section.

   Otherwise, open the [CloudFormation Console](https://console.aws.amazon.com/cloudformation/home)
   and continue from step 6 of the AWS Console instructions above.

## Source Images

The S3 key of any given file, minus the extension, is its IIIF ID. For example, if you want to access the image manifest for the file at `abcdef.tif`, you would get `https://.../iiif/2/abcdef/info.json`. If your key contains slashes, they must be URL-encoded: e.g., `ab/cd/ef/gh.tif` would be at `https://.../iiif/2/ab%2Fcd%2Fef%2Fgh/info.json`. (This limitation could easily be fixed by encoding only the necessary slashes in the incoming URL before handing it off to the IIIF processor, but that's beyond the scope of the demo.)

`iiif-processor` can use any image format _natively_ supported by [libvips](https://libvips.github.io/libvips/), but best results will come from using tiled, multi-resolution TIFFs. The Lambda Function wrapper included in this application assumes a `.tif` extension.

### Creating tiled TIFFs

#### Using VIPS

    vips tiffsave source_image.tif output_image.tif --tile --pyramid --compression jpeg --tile-width 256 --tile-height 256

#### Using ImageMagick

    convert source_image.tif -define tiff:tile-geometry=256x256 -compress jpeg 'ptif:output_image.tif'

## Known Limitations

AWS API Gateway Lamnbda integration has a payload (request/response body) size limit of approximately 6MB in both directions. Please see [LAMBDA_LIMIT.md](LAMBDA_LIMIT.md) for details and workarounds.

## License

This software is licensed under the [Apache License, Version 2.0](https://opensource.org/licenses/Apache-2.0). Dependencies are subject to their own licenses.
