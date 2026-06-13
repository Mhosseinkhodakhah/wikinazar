import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Meta } from '../layout/Meta';
import { api } from '../utils/api';
import { Footer } from './Footer';

function toPersianNum(n: number): string {
  const pd = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n)
    .split('')
    .map((c) => pd[parseInt(c, 10)] || c)
    .join('');
}

function toPersianDecimal(n: number): string {
  const pd = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const formatted = n.toFixed(1);
  return formatted
    .split('')
    .map((c) => pd[parseInt(c, 10)] || c)
    .join('');
}

const values = [
  {
    title: 'شفافیت',
    desc: 'همه نظرات و تجربیات بدون سانسور منتشر می‌شوند تا کاربران بتوانند با اطلاعات کامل تصمیم بگیرند.',
    icon: (
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
  },
  {
    title: 'جامعه‌محوری',
    desc: 'ویکی‌نظر توسط کاربرانش ساخته می‌شود. هر تجربه‌ای که ثبت می‌کنید به دیگران در انتخاب بهتر کمک می‌کند.',
    icon: (
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    title: 'دسترسی رایگان',
    desc: 'همه محتوای ویکی‌نظر کاملاً رایگان و بدون نیاز به اشتراک در دسترس است.',
    icon: (
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
        />
      </svg>
    ),
  },
  {
    title: 'تنوع موضوعی',
    desc: 'از محصولات دیجیتال گرفته تا خدمات و مکان‌ها، هر چیزی که نیاز به نظر دارید در ویکی‌نظر پیدا می‌شود.',
    icon: (
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
];

const About = () => {
  const [siteStats, setSiteStats] = useState([
    { value: '۰', label: 'موضوع', icon: '📋' },
    { value: '۰', label: 'تجربه', icon: '💬' },
    { value: '۰', label: 'درخواست', icon: '📝' },
    { value: '۰', label: 'میانگین امتیاز', icon: '⭐' },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const [subjectsRes, experiencesRes, requestsRes] = await Promise.all([
          api.getSubjects({ limit: 0 }),
          api.getExperiences({ limit: 0 }),
          api.getRequests(),
        ]);
        const totalRating = experiencesRes.experiences.reduce(
          (sum, e) => sum + e.rating,
          0,
        );
        const avgRating =
          experiencesRes.experiences.length > 0
            ? totalRating / experiencesRes.experiences.length
            : 0;
        setSiteStats([
          {
            value: toPersianNum(subjectsRes.total),
            label: 'موضوع',
            icon: '📋',
          },
          {
            value: toPersianNum(experiencesRes.total),
            label: 'تجربه',
            icon: '💬',
          },
          {
            value: toPersianNum(requestsRes.total),
            label: 'درخواست',
            icon: '📝',
          },
          {
            value: avgRating > 0 ? toPersianDecimal(avgRating) : '۰',
            label: 'میانگین امتیاز',
            icon: '⭐',
          },
        ]);
      } catch {
        // keep defaults
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800" dir="rtl">
      <Meta
        title="درباره ما - ویکی‌نظر"
        description="درباره پلتفرم اشتراک‌گذاری تجربیات و نظرات ویکی‌نظر بیشتر بدانید."
      />

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in-left {
          animation: fade-in-left 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Hero */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 pb-20 pt-16 md:pb-28 md:pt-24"
        style={{ animation: 'fade-in-up 0.7s ease-out forwards' }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-10 size-52 rounded-full bg-white/10 blur-3xl md:size-72" />
          <div className="absolute bottom-10 right-1/4 size-48 rounded-full bg-white/10 blur-3xl md:size-64" />
          <div className="animate-float absolute left-1/2 top-1/3 size-36 rounded-full bg-teal-300/20 blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjA2Ii8+PC9zdmc+')]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="animate-scale-in mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-white/90 backdrop-blur-md md:mb-6 md:px-5 md:py-2 md:text-sm">
            داستان ویکی‌نظر
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white md:mb-6 md:text-5xl">
            به <span className="text-white/90">ویکی‌نظر</span> خوش آمدید
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/80 md:text-lg">
            پلتفرمی برای اشتراک‌گذاری تجربیات و نظرات واقعی کاربران. اینجا هر
            کسی می‌تواند تجربه خود را درباره محصولات، خدمات و مکان‌های مختلف به
            اشتراک بگذارد.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="relative -mt-12 px-4 md:-mt-16">
        <div
          className="animate-fade-in-up mx-auto max-w-5xl"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg md:p-10">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-right">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-2xl shadow-lg md:size-20">
                🎯
              </div>
              <div>
                <h2 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
                  ماموریت ما
                </h2>
                <p className="leading-relaxed text-gray-600">
                  ما در ویکی‌نظر معتقدیم قبل از هر تصمیمی، شنیدن تجربه دیگران
                  می‌تواند بهترین راهنما باشد. هدف ما ایجاد بزرگ‌ترین مرجع نظرات
                  و تجربیات کاربران فارسی‌زبان است تا همه بتوانند آگاهانه‌ترین
                  انتخاب را داشته باشند.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {siteStats.map((stat, i) => (
            <div
              key={stat.label}
              className="animate-fade-in-up rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div className="mb-2 text-2xl md:text-3xl">{stat.icon}</div>
              <div className="text-xl font-bold text-gray-900 md:text-2xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-gray-500 md:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="animate-fade-in-up mb-10 text-center md:mb-14">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
              ارزش‌های ما
            </h2>
            <p className="text-sm text-gray-500 md:text-base">
              اصولی که ویکی‌نظر بر پایه آن ساخته شده
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="animate-fade-in-up group rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 hover:shadow-md md:p-6"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 transition-colors group-hover:bg-teal-200 md:size-12">
                  {v.icon}
                </div>
                <h3 className="mb-2 text-sm font-bold text-gray-900 md:text-base">
                  {v.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-600 md:text-sm">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sunbit */}
      <div className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-teal-50 to-white shadow-lg">
            <div className="flex flex-col items-center gap-6 p-8 text-center md:flex-row md:gap-10 md:p-12 md:text-right">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-3xl font-bold text-white shadow-lg md:size-24 md:text-4xl">
                S
              </div>
              <div className="flex-1">
                <h2 className="mb-1 text-xl font-bold text-gray-900 md:text-2xl">
                  ساخته شده با ❤️ توسط تیم
                </h2>
                <a
                  href="https://sunbit.ir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-2xl font-black text-teal-600 transition-all hover:text-teal-700 md:text-3xl"
                >
                  Sunbit
                  <svg
                    className="size-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
                  ما در Sunbit به ساخت محصولات دیجیتال با کیفیت و تجربه کاربری
                  فوق‌العاده اعتقاد داریم. ویکی‌نظر یکی از پروژه‌های متن‌باز
                  ماست که با هدف کمک به جامعه ساخته شده.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
                  <a
                    href="https://sunbit.ir"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.03] hover:shadow-lg active:scale-95"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    sunbit.ir
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 py-14 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-1/3 top-10 size-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/4 size-56 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white md:mb-4 md:text-3xl">
            آماده‌ای تجربه‌ات رو به اشتراک بذاری؟
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
            با ثبت اولین تجربه‌ات، به جمع کاربران ویکی‌نظر بپیوند و به دیگران
            کمک کن
          </p>
          <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:gap-4">
            <Link
              href="/submit"
              className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-teal-600 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gray-50 hover:shadow-xl active:scale-95 md:px-10 md:py-3.5 md:text-base"
            >
              ثبت تجربه جدید
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-white/30 px-8 py-3 text-sm font-semibold text-white/90 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:text-white active:scale-95 md:px-10 md:py-3.5 md:text-base"
            >
              صفحه اصلی
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export { About };
