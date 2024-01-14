import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head
        title='iManage Factory'
        description='iManage Factory'
        keywords='iManage Factory'
      >
        <link rel='manifest' href='/manifest.json' />
        <link rel='apple-touch-icon' href='/img/logo.svg' />
        <meta name='theme-color' content='#6d7ecb' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}