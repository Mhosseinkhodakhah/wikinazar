import '../styles/global.css';

import type { AppProps } from 'next/app';

import { MobileLayout } from '../layout/MobileLayout';
import { AuthProvider } from '../utils/AuthContext';
import { ErrorBoundary } from '../utils/ErrorBoundary';
import { ToastProvider } from '../utils/ToastContext';
import { useMobile } from '../utils/useMobile';

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
      </ToastProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default MyApp;
