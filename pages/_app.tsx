// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';

import '../styles/globals.css';

import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import ChatbotWidget from '@/components/ChatbotWidget';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MenthIA</title>
      </Head>

      <AuthProvider>
        <CartProvider>
          <Component {...pageProps} />

          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          <ChatbotWidget />
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
