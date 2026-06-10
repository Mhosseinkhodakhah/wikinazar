import Link from 'next/link';
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-8 text-center"
          dir="rtl"
        >
          <span className="text-5xl">💥</span>
          <h1 className="text-xl font-bold text-gray-800">خطایی رخ داد!</h1>
          <p className="max-w-md text-sm text-gray-500">
            {this.state.error?.message ??
              'متأسفانه مشکلی پیش آمده. لطفاً دوباره تلاش کنید.'}
          </p>
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
