import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />

        {/* Google Fonts preconnect for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Theme color for browser chrome */}
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#1b1b1b"
          media="(prefers-color-scheme: dark)"
        />

        {/* Google Search Console verification — replace content with your verification code */}
        {/* <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" /> */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
