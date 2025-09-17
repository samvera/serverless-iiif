import CallToAction from './CallToAction';
import Image from 'next/image';
import classNames from './HomepageHeader.module.css';
import lightDiagram from '../public/assets/serverless-iiif-diagram.png';

const HomepageHeader = () => {
  return (
    <div className={classNames.header}>
      <h1 className={classNames.headline}>Fast, zoomable images without servers</h1>
      <p className={classNames.subtitle}>
       A cost-effective, infinitely scalable <a href="https://iiif.io/api/image/3.0">IIIF Image API v2.1</a> and <a href="https://iiif.io/api/image/3.0">v3.0</a> compliant service packaged
       as an AWS Serverless Application with minimum setup and no maintenance. Suitable for large institutional collections or
       small digital humanities projects.
        <br/>Community Driven. Open Source.
      </p>
      <CallToAction newTab={true} href='https://console.aws.amazon.com/lambda/home#/create/app?applicationId=arn:aws:serverlessrepo:us-east-1:625046682746:applications/serverless-iiif' text='Deploy Now' />
      &nbsp;<CallToAction href='/docs' text='Read the Docs' />

      <Image
        src={lightDiagram}
        alt='IIIF Image API'
        style={{
          marginTop: '2rem',
          width: '100%'
        }}
      />
    </div>
  );
};

export default HomepageHeader;
