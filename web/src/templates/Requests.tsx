import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Meta } from '../layout/Meta';
import type { RequestDTO } from '../utils/api';
import { api } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { useToast } from '../utils/ToastContext';

const categories = [
  { id: 'all', name: 'همه', icon: '🌟' },
  { id: 'tech', name: 'فناوری', icon: '💻' },
  { id: 'travel', name: 'سفر', icon: '✈️' },
  { id: 'food', name: 'غذا', icon: '🍽️' },
  { id: 'education', name: 'آموزش', icon: '📚' },
  { id: 'health', name: 'سلامت', icon: '💪' },
  { id: 'entertainment', name: 'سرگرمی', icon: '🎬' },
  { id: 'shopping', name: 'خرید', icon: '🛍️' },
  { id: 'services', name: 'خدمات', icon: '🔧' },
];

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'همین الان';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  if (hours < 24) return `${hours} ساعت پیش`;
  if (days < 7) return `${days} روز پیش`;
  if (weeks < 4) return `${weeks} هفته پیش`;
  return `${months} ماه پیش`;
}

const Requests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'top'>('newest');
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [requests, setRequests] = useState<RequestDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const params: {
          sortBy?: string;
          sortOrder?: 'ASC' | 'DESC';
        } = {};

        if (sortBy === 'top') {
          params.sortBy = 'votes';
          params.sortOrder = 'DESC';
        } else {
          params.sortBy = 'createdAt';
          params.sortOrder = 'DESC';
        }

        const data = await api.getRequests(params);
        setRequests(data.requests);
      } catch {
        toast('خطا در دریافت درخواست‌ها', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [activeCategory, sortBy]);

  const handleVote = async (id: string) => {
    if (!user) {
      toast('برای رای دادن ابتدا وارد حساب خود شوید', 'error');
      return;
    }
    try {
      const result = await api.voteRequest(id);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, votes: result.votes } : r)),
      );
      setVoted((prev) => ({ ...prev, [id]: !prev[id] }));
      toast(voted[id] ? 'رای شما لغو شد' : 'رای شما ثبت شد', 'success');
    } catch {
      toast('خطا در ثبت رای', 'error');
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-700 antialiased"
      dir="rtl"
    >
      <Meta
        title="درخواست‌ها - ویکی‌نظر"
        description="درخواست‌های ثبت‌نشده برای تجربه"
      />

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-gray-800"
          >
            <svg
              className="size-6 text-teal-500"
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
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/request"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-md"
            >
              <svg
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              ثبت درخواست جدید
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
            >
              ← بازگشت
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 to-white py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[15%] top-[10%] size-[200px] rounded-full bg-teal-100/50 blur-[80px] md:size-[300px]" />
          <div className="absolute bottom-[10%] right-[15%] size-[180px] rounded-full bg-cyan-100/50 blur-[80px] md:size-[250px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
            درخواست‌های ثبت‌نشده
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
            به دیگران کمک کن تا تجربه مورد نظرشون رو پیدا کنن
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <div className="scrollbar-hide -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all md:text-sm ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                    : 'border border-gray-300 bg-white text-gray-600 hover:border-teal-200 hover:text-teal-600'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">
              مرتب‌سازی:
            </span>
            <div className="flex gap-1">
              {[
                { value: 'newest', label: 'جدیدترین' },
                { value: 'top', label: 'پررای‌ترین' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as 'newest' | 'top')}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    sortBy === opt.value
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {(() => {
          if (loading) {
            return (
              <div className="flex items-center justify-center py-16">
                <div className="size-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-500" />
              </div>
            );
          }
          if (requests.length === 0) {
            return (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                <span className="text-4xl">🔍</span>
                <p className="text-sm font-semibold text-gray-600">
                  هیچ درخواستی یافت نشد
                </p>
                <p className="text-xs text-gray-500">
                  با تغییر فیلترها یا دسته‌بندی دوباره امتحان کن
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSortBy('newest');
                  }}
                  className="rounded-lg bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-700 transition-all hover:bg-teal-100"
                >
                  حذف همه فیلترها
                </button>
              </div>
            );
          }
          return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="group flex flex-col rounded-xl border border-gray-300 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Title */}
                  <h3 className="mb-1.5 text-sm font-bold text-gray-800 transition-colors group-hover:text-teal-600 md:text-base">
                    {req.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-600 md:text-sm">
                    {req.description}
                  </p>

                  {/* User & Date */}
                  <div className="mb-3 flex items-center gap-2 border-t border-gray-200 pt-3 text-[10px] text-gray-500 md:text-xs">
                    <span className="flex items-center gap-1">
                      <svg
                        className="size-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {req.requester?.displayName || 'کاربر'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="size-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatRelativeTime(req.createdAt)}
                    </span>
                  </div>

                  {/* Vote & Action */}
                  <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(req.id)}
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
                          voted[req.id]
                            ? 'border-teal-200 bg-teal-50 text-teal-600'
                            : 'border-gray-300 text-gray-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600'
                        }`}
                      >
                        <svg
                          className={`size-3.5 transition-transform ${voted[req.id] ? 'scale-110 fill-current' : ''}`}
                          fill={voted[req.id] ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        {req.votes + (voted[req.id] ? 1 : 0)}
                      </button>
                    </div>
                    <Link
                      href={`/submit?subject=${encodeURIComponent(req.title)}`}
                      className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-md"
                    >
                      ثبت تجربه
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* CTA Section */}
      <div className="border-t border-gray-200 bg-gradient-to-b from-white to-teal-50/50 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-3 text-xl font-bold text-gray-900 md:text-2xl">
            درخواستی داری که ثبت نشده؟
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            با ثبت درخواست خود، دیگران رو دعوت کن تا تجربه‌شون رو برات به اشتراک
            بذارن
          </p>
          <Link
            href="/request"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            ثبت درخواست جدید
          </Link>
        </div>
      </div>
    </div>
  );
};

export { Requests };
