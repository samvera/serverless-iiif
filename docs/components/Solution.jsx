import Image from 'next/image';
import classNames from './Solution.module.css';
import iconApiGateway from '../public/assets/icon-api-gateway.png';
import iconLambda from '../public/assets/icon-lambda.png';
import iconNode from '../public/assets/icons8-nodejs-240.png';
import iconS3 from '../public/assets/icon-s3.png';
import iconSam from '../public/assets/icon-aws-sam.png';

const parts = [
  {
    logo: iconNode,
    label: 'NodeJS',
    description: (
      <p>
        <a href='https://www.npmjs.com/package/iiif-processor' target='_blank'>
          iiif-processor
        </a>{' '}
        – turns a IIIF URL path into an image or info.json result
      </p>
    )
  },
  {
    logo: iconLambda,
    label: 'AWS Lambda',
    description: (
      <p>
        <a href='https://github.com/nulib/serverless-iiif/' target='_blank'>
          serverless-iiif
        </a>{' '}
        – Lambda function wrapper function that mediates between the web service
        and the node module
      </p>
    )
  },
  {
    logo: iconApiGateway,
    label: 'API Gateway',
    description: (
      <p>
        Converts web requests into AWS Lambda calls and returns the result to
        the client
      </p>
    )
  },
  {
    logo: iconS3,
    label: 'Amazon S3',
    description: <span>Image Storage</span>
  },
  {
    logo: iconSam,
    label: 'AWS Serverless App Repository',
    description: (
      <p>
        Application versioning, packaging, quick deployment, and reusability
      </p>
    )
  }
];

export default function Solution() {
  return (
    <div className={classNames.wrapper}>
      {parts.map((part, index) => {
        return (
          <div className={classNames.row} key={index}>
            <div className={classNames.logo}>
              {part.logo && <Image src={part.logo} alt={part.label} />}
            </div>
            <div className={classNames.label}>
              <h3>{part.label}</h3>
              {part.description}
            </div>
          </div>

        );
      })}
    </div>
  );
}
