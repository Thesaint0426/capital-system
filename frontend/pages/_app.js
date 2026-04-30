import '../styles/globals.css';
import { AuthProvider } from '../lib/auth';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>Capital Invest — Private Investment Management</title>
        <meta name="description" content="Private capital management through structured 30-day investment cycles." />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#050505" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111',
            color: '#f0f0f0',
            border: '1px solid #2a2a2a',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00ff88', secondary: '#000' } },
          error: { iconTheme: { primary: '#ff4d4d', secondary: '#000' } },
        }}
      />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
