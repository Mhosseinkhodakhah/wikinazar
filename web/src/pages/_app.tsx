import '../styles/global.css';

import type { AppProps } from 'next/app';
import { useCallback, useEffect, useState } from 'react';

import { LoginModal } from '../components/LoginModal';
import { MobileLayout } from '../layout/MobileLayout';
import { AuthProvider } from '../utils/AuthContext';
import { ErrorBoundary } from '../utils/ErrorBoundary';
import { ToastProvider } from '../utils/ToastContext';
import { useMobile } from '../utils/useMobile';

const GlobalLoginHandler = () => {
  const [open, setOpen] = useState(false);

  const handleUnauthorized = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [handleUnauthorized]);

  return <LoginModal open={open} onClose={() => setOpen(false)} />;
};

const AppShell = ({ Component, pageProps }: AppProps) => {
  const isMobile = useMobile();

  const content = <Component {...pageProps} />;

  if (isMobile) {
    return <MobileLayout>{content}</MobileLayout>;
  }

  return content;
};

const MyApp = (props: AppProps) => (
  <ErrorBoundary>
    <AuthProvider>
      <ToastProvider>
        <AppShell {...props} />
        <GlobalLoginHandler />
      </ToastProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default MyApp;
