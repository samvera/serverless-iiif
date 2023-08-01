import CallToAction from './CallToAction';
import Image from 'next/image';
import classNames from './HomepageHeader.module.css';
import lightDiagram from '../public/assets/serverless-iiif-diagram.png';

const HomepageHeader = () => {
  return (
    <div className={classNames.header}>
      <h1 className={classNames.headline}>Serve images via IIIF</h1>
      <p className={classNames.subtitle}>
        A IIIF 2.1 Image API compliant server written as an AWS Serverless
        Application.
        <br />
        Community Driven. Open Source.
      </p>
      <CallToAction href='/docs' text='Get started' />

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
