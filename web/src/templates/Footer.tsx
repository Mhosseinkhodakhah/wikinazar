import Link from 'next/link';

const Footer = () => (
  <footer className="relative overflow-hidden border-t border-gray-200 bg-blue-100">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute right-1/4 top-10 size-64 rounded-full bg-teal-400/5 blur-3xl" />
    </div>
    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <span className="inline-flex items-center gap-2 text-xl font-bold text-black">
            <svg
              className="size-7 text-teal-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            ویکی‌نظر
          </span>
          <p className="mt-4 text-sm leading-relaxed text-black/60">
            پلتفرم اشتراک‌گذاری تجربیات و نظرات درباره محصولات، خدمات، مکان‌ها و
            هر چیز دیگر. قبل از هر انتخابی، تجربه دیگران را ببینید.
          </p>
        </div>
        <div className="md:mr-auto">
          <h4 className="mb-4 text-sm font-semibold tracking-wider text-black/80">
            لینک‌های سریع
          </h4>
          <ul className="space-y-3">
            {['صفحه اصلی', 'درباره ما', 'تماس با ما', 'قوانین'].map((item) => (
              <li key={item}>
                <Link
                  href="/"
                  className="text-sm text-black/60 transition-colors hover:text-teal-600"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-wider text-black/80">
            ما را دنبال کنید
          </h4>
          <div className="flex gap-3">
            {[
              {
                name: 'GitHub',
                path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
              },
              {
                name: 'Twitter',
                path: 'M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z',
              },
              {
                name: 'LinkedIn',
                path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
              },
            ].map((social) => (
              <Link
                key={social.name}
                href="/"
                className="flex size-10 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-black/50 transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d={social.path} />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-12 border-t border-gray-200 pt-8 text-center">
        <p className="text-sm text-black/50">
          &copy; Copyright {new Date().getFullYear()} ویکی‌نظر. تمامی حقوق محفوظ
          است.
        </p>
      </div>
    </div>
  </footer>
);

export { Footer };
