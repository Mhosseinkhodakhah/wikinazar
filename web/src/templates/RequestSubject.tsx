import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LoginModal } from '../components/LoginModal';
import { Meta } from '../layout/Meta';
import type { RequestDTO } from '../utils/api';
import { api } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { useToast } from '../utils/ToastContext';

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'چند لحظه پیش';
  if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  if (diffDays < 7) return `${diffDays} روز پیش`;
  if (diffWeeks < 4) return `${diffWeeks} هفته پیش`;
  return `${diffMonths} ماه پیش`;
}

const RequestSubject = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [recentRequests, setRecentRequests] = useState<RequestDTO[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    api
      .getCategories()
      .then((res) =>
        setCategories(res.map((c) => ({ id: c.slug, name: c.name }))),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    api
      .getRequests({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' })
      .then((data) => setRecentRequests(data.requests))
      .catch(() => toast('خطا در دریافت درخواست‌های اخیر', 'error'));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    const file = files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImages((prev) => [...prev, url]);
      toast('عکس با موفقیت آپلود شد', 'success');
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);
    try {
      await api.createRequest({
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category || undefined,
      });
      toast('درخواست شما با موفقیت ثبت شد!', 'success');
      setFormData({ title: '', description: '', category: '' });
    } catch {
      toast('خطا در ثبت درخواست', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-50"
        dir="rtl"
      >
        <div className="size-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-8 text-center"
        dir="rtl"
      >
        <Meta
          title="درخواست موضوع - ویکی‌نظر"
          description="برای ثبت درخواست وارد حساب خود شوید."
        />
        <span className="text-5xl">🔐</span>
        <h1 className="text-xl font-bold text-gray-800">
          برای ثبت درخواست باید وارد حساب خود شوید
        </h1>
        <p className="text-sm text-gray-600">
          لطفاً ابتدا وارد شوید یا ثبت‌نام کنید
        </p>
        <button
          onClick={() => setShowLoginModal(true)}
          className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600"
        >
          ورود / ثبت‌نام
        </button>
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-700">
          بازگشت به صفحه اصلی
        </Link>
        <LoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-700 antialiased"
      dir="rtl"
    >
      <Meta
        title="درخواست موضوع - ویکی‌نظر"
        description="موضوع مورد نظرت رو درخواست کن تا دیگران تجربه‌شون رو به اشتراک بذارن."
      />

      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 lg:px-8">
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
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[20%] size-[200px] rounded-full bg-teal-100/60 blur-[80px]" />
          <div className="absolute right-[10%] top-[30%] size-[180px] rounded-full bg-cyan-100/60 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs text-gray-600 shadow-sm">
            <span className="size-1.5 rounded-full bg-teal-400" />
            درخواست موضوع
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            موضوع مورد نظرت رو{' '}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              درخواست کن
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-600">
            اگه چیزی رو پیدا نمی‌کنی، درخواست بده تا دیگران تجربه‌شون رو به
            اشتراک بذارن
          </p>
        </div>
      </div>

      {/* Form + Tips Section */}
      <div className="border-b border-gray-200 bg-white py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Form */}
            <div>
              <h2 className="mb-6 text-lg font-bold text-gray-800">
                ثبت درخواست جدید
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    عنوان موضوع
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="مثال: آموزش برنامه‌نویسی پایتون"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:shadow-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    توضیحات بیشتر
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="توضیح مختصری درباره چیزی که می‌خوای"
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:shadow-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    دسته‌بندی
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:border-teal-300 focus:shadow-sm focus:outline-none"
                  >
                    <option value="">بدون دسته‌بندی</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Image Upload */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    تصویر (اختیاری)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-4 text-sm text-gray-600 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600">
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      افزودن عکس
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    {uploadedImages.length > 0 && (
                      <span className="text-xs text-teal-600">
                        {uploadedImages.length} عکس انتخاب شد
                      </span>
                    )}
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className="group relative">
                          <img
                            src={img}
                            alt={`upload ${i + 1}`}
                            className="size-20 rounded-xl object-cover shadow-sm"
                          />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-sm transition-all hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'در حال ثبت...' : 'ثبت درخواست'}
                </button>
              </form>
            </div>

            {/* Tips */}
            <div>
              <h2 className="mb-6 text-lg font-bold text-gray-800">
                چطور کار می‌کنه؟
              </h2>
              <div className="rounded-xl border border-teal-100 bg-teal-50 p-5">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed text-teal-800">
                  بعد از ثبت درخواست، سایر کاربران می‌تونن تجربه خودشون رو اضافه
                  کنن. به این ترتیب می‌تونی از تجربه دیگران در مورد موضوعات
                  مختلف استفاده کنی.
                </p>
              </div>

              <h3 className="mb-4 mt-8 text-sm font-bold text-gray-800">
                درخواست‌های اخیر
              </h3>
              <div className="space-y-3">
                {recentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 p-3 transition-all hover:border-teal-200 hover:bg-teal-50/50"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-600">
                      {req.votes}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {req.title}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {formatRelativeTime(req.createdAt)} ·{' '}
                        {req.requester?.displayName || 'کاربر'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Requested */}
      <div className="border-b border-gray-200 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-500">
              درخواست‌های اخیر
            </span>
            <h2 className="mt-3 text-xl font-bold text-gray-900 md:text-2xl">
              موضوعاتی که دیگران درخواست کرده‌اند
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
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
                        d="M5 7h14M5 12h14M5 17h14"
                      />
                    </svg>
                    {req.votes} رأی
                  </div>
                </div>
                <h3 className="mb-1 text-sm font-bold text-gray-800">
                  {req.title}
                </h3>
                <p className="mb-3 line-clamp-2 text-xs text-gray-600">
                  {req.description}
                </p>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-[10px] text-gray-500">
                  <span>{req.requester?.displayName || 'کاربر'}</span>
                  <span>{formatRelativeTime(req.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-teal-100 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-black/50">
          &copy; Copyright {new Date().getFullYear()} ویکی‌نظر. تمامی حقوق محفوظ
          است.
        </div>
      </footer>
    </div>
  );
};

export { RequestSubject };
