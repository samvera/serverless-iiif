import Link from 'next/link';
import classNames from './CallToAction.module.css';

const CallToAction = ({ href, text, newTab }) => {
  const target = newTab ? '_blank' : '_self';
  return (
    <Link href={href} className={`nx-bg-primary-400/10 ${classNames.cta}`} target={target}>
      {text} <span>→</span>
    </Link>
  );
};

export default CallToAction;
