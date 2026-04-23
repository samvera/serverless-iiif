## `create-metadata`

The `create-metadata` script can probe one or more image files and set the appropriate `width`, `height`, `pages`, and tile size metadata.

#### Prerequisites

- [NodeJS](https://nodejs.org/) >= v22.x
- [AWS CLI](https://aws.amazon.com/cli/)

#### Step 1

Make sure the AWS CLI is [properly configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) with credentials that have read/write access to the S3 bucket containing the images that will be served by `serverless-iiif`

#### Step 2

Clone this repository.

#### Step 3

Install runtime dependencies:
```shell
npm ci
```

#### Step 4

Run the script:
```shell
export sourceBucket="my-image-bucket" # corresponds to the SourceBucket deploy parameter
export resolverTemplate="%s.tif" # corresponds to the ResolverTemplate deploy parameter
npm run create-metadata image_id_1 image_id_2 image_id_3
```

Or to process every file in the bucket, regardless of type:
```shell
export sourceBucket="my-image-bucket"
export resolverTemplate="%s"
aws s3 ls --recursive s3://my-image-bucket/ \
  | awk '{ print $4 }' \
  | xargs -n 50 npm run create-metadata
```

#### Step 5
Verify the output:
```shell
aws s3api head-object --bucket my-image-bucket --key image_id_1.tif
```
