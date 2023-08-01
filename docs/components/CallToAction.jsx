import Link from 'next/link';
import classNames from './CallToAction.module.css';

const CallToAction = ({ href, text }) => {
  return (
    <Link href={href} className={`nx-bg-primary-400/10 ${classNames.cta}`}>
      {text} <span>→</span>
    </Link>
  );
};

export default CallToAction;
