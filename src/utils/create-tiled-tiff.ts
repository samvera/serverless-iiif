import sharp from "sharp";
import concat from "concat-stream";
import { s3Stream } from "../resolvers";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_DIMENSION = 15000;
const TILE_SIZE = 256;

type PyramidMetadata = {
  width: number;
  height: number;
  pages: number;
};

const locationFromUri = (uri: string) => {
  const parsedUri = new URL(uri);
  return {
    Bucket: parsedUri.host,
    Key: parsedUri.pathname.slice(1),
  };
};

export const createPyramidTiff = (source, dest) => {
  return new Promise((resolve, reject) => {
    console.log(`Creating pyramid from ${source}`);
    const sourceLocation = locationFromUri(source);
    const destLocation = locationFromUri(dest);

    s3Stream(sourceLocation)
      .then((inputStream) => {
        const transformStream = sharp({
          limitInputPixels: false,
          sequentialRead: true,
          unlimited: true,
        })
          .removeAlpha()
          .resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: "inside",
            withoutEnlargement: true,
          })
          .rotate()
          .tiff({
            compression: "jpeg",
            quality: 75,
            tile: true,
            tileHeight: TILE_SIZE,
            tileWidth: TILE_SIZE,
            pyramid: true,
          });

        const uploadStream = concat((data) => {
          sharp(data)
            .metadata()
            .then((info) => {
              console.log(`Saving to ${dest}`);
              uploadToS3(data, destLocation, info as PyramidMetadata)
                .then((result) => resolve(result))
                .catch((err) => reject(err));
            });
        });

        inputStream.pipe(transformStream).pipe(uploadStream);
      })
      .catch((err) => reject(err));
  });
};

const uploadToS3 = (data, location, { width, height, pages }) => {
  return new Promise((resolve, reject) => {
    const s3Client = new S3Client(s3ClientOpts());
    const cmd = new PutObjectCommand({
      ...location,
      Body: data,
      ContentType: "image/tiff",
      Metadata: {
        "iiif-width": width.toString(),
        "iiif-height": height.toString(),
        "iiif-pages": pages.toString(),
        "iiif-tilesize": TILE_SIZE.toString(),
      },
    });

    s3Client
      .send(cmd)
      .then((_data) => resolve(location))
      .catch((err) => reject(err));
  });
};

const s3ClientOpts = () => {
  return { httpOptions: { timeout: 600000 } };
};

/* istanbul ignore next */
if (require.main === module) {
  const [source, dest] = process.argv.slice(2);
  if (!source || !dest) {
    console.error(
      "Usage: node create-tiled-tiff.js <s3://source-bucket/key> <s3://dest-bucket/key>",
    );
    process.exit(1);
  }
  createPyramidTiff(source, dest)
    .then((result) => console.log("Pyramid TIFF created at:", result))
    .catch((err) => console.error("Error creating pyramid TIFF:", err));
}
