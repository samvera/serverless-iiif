import Logo from './components/Logo';
import { useRouter } from 'next/router';

export default {
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} © <a href='#'>Serverless IIIF</a>.
      </span>
    )
  },
  head: (
    <>
      <meta property='og:title' content='Serverless IIIF' />
      <meta property='og:description' content='Serve images via IIIF' />
      <link rel='shortcut icon' type='image/png' href='/favicon.png' />
    </>
  ),
  logo: <Logo />,
  primaryHue: 209,
  project: {
    link: 'https://github.com/samvera/serverless-iiif'
  },
  sidebar: {
    autoCollapse: true,
    defaultMenuCollapseLevel: 1
  },
  // eslint-disable-next-line
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – Serverless IIIF'
      };
    }
  }
};
