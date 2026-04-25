import '../styles/globals.css';
import { AuthProvider } from '../lib/auth';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
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
          success: {
            iconTheme: { primary: '#00ff88', secondary: '#000' },
          },
          error: {
            iconTheme: { primary: '#ff4d4d', secondary: '#000' },
          },
        }}
      />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
