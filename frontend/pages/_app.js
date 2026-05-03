import '../styles/globals.css';
import { AuthProvider } from '../lib/auth';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>Capital Invest — Private Capital Platform</title>
        <meta name="description" content="A selective private capital platform designed for disciplined participation through managed performance cycles." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#080808" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#141414',
            color: '#f5f3ef',
            border: '1px solid #252525',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '13px',
            borderRadius: '8px',
          },
          success: { iconTheme: { primary: '#3ecf8e', secondary: '#000' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#000' } },
        }}
      />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
