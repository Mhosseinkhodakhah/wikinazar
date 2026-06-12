import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Meta } from '../layout/Meta';
import type { SubjectDTO } from '../utils/api';
import { api } from '../utils/api';

function toPersianNum(n: number): string {
  const pd = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n)
    .split('')
    .map((c) => pd[parseInt(c, 10)] || c)
    .join('');
}

const SearchResults = () => {
  const router = useRouter();
  const { q } = router.query;
  const [results, setResults] = useState<SubjectDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (q && typeof q === 'string') {
      setInputValue(q);
      setLoading(true);
      api
        .getSubjects({ search: q, limit: 50 })
        .then((res) => setResults(res.subjects))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [q]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700" dir="rtl">
      <Meta
        title={`نتایج جستجو برای "${q}" - ویکی‌نظر`}
        description={`نتایج جستجو برای ${q}`}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-lg font-bold text-gray-900"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-bold text-white shadow-sm">
              و
            </div>
            ویکی‌نظر
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white p-1.5 shadow-lg shadow-black/5 transition-all duration-300 focus-within:border-teal-300 focus-within:shadow-teal-200/50">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="جستجوی موضوع..."
              className="flex-1 rounded-lg bg-gray-50 px-4 py-3 text-right text-sm text-gray-700 placeholder:text-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:from-teal-600 hover:to-cyan-600"
            >
              بگرد
            </button>
          </div>
        </form>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            نتایج جستجو برای &ldquo;{q}&rdquo;
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading
              ? 'در حال جستجو...'
              : `${toPersianNum(results.length)} نتیجه پیدا شد`}
          </p>
        </div>

        {(() => {
          if (loading) {
            return (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-xl bg-gray-200"
                  />
                ))}
              </div>
            );
          }
          if (results.length === 0) {
            return (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
                <span className="text-4xl">🔍</span>
                <p className="text-sm font-semibold text-gray-600">
                  نتیجه‌ای یافت نشد!
                </p>
                <p className="text-xs text-gray-500">با کلمات دیگه امتحان کن</p>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/subject/${subject.id}`}
                  className="group overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative">
                    <img
                      src={
                        subject.icon ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(subject.title)}&background=teal&color=fff`
                      }
                      alt={subject.title}
                      loading="lazy"
                      className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-44"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-800 transition-colors group-hover:text-teal-600">
                      {subject.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {subject.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{toPersianNum(subject.experienceCount)} تجربه</span>
                      {subject.category && (
                        <>
                          <span className="size-1 rounded-full bg-gray-300" />
                          <span>{subject.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export { SearchResults };
