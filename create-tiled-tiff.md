## `create-tiled-tiff`

The `create-tiled-tiff` script can convert a source image stored in an AWS S3 bucket to a tiled, multi-resolution TIFF and write it to another AWS S3 bucket.

#### Specs

`create-tiled-tiff` makes several assumptions, which may or may not be what you want, but its settings should work well for most use cases.

- Flattens the image to three channels, removing the alpha channel if present
- Reduces the image to a maxiumum of 15,000 pixels per side
- Rotates the image to [EXIF Orientation 1](http://sylvana.net/jpegcrop/exif_orientation.html)
- Creates the pyramidal TIFF using JPEG compression at 75% quality, with a tile size of 256x256 pixels

#### Prerequisites

- [NodeJS](https://nodejs.org/) >= v22.x
- [AWS CLI](https://aws.amazon.com/cli/)

#### Step 1

Make sure the AWS CLI is [properly configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) with credentials that have read access to the source S3 bucket and read/write access to the destination S3 bucket.

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
npm run create-tiled-tiff s3://source-bucket/path/to/source/image s3://destination-bucket/path/to/output/image.tif
```

#### Step 5
Verify the output:
```shell
aws s3api head-object --bucket destination-bucket --key path/to/output/image.tif
```