import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { Meta } from '../layout/Meta';
import type { SubjectDTO } from '../utils/api';
import { api } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { StarRating } from '../utils/StarRating';
import { useToast } from '../utils/ToastContext';

const categoryOptions = [
  'فناوری',
  'سفر',
  'غذا',
  'آموزش',
  'سلامت',
  'سرگرمی',
  'خرید',
  'خدمات',
];

const SubmitExperience = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState(
    () => (router.query.subject as string) || '',
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectDTO | null>(
    null,
  );
  const [showNewSubject, setShowNewSubject] = useState(false);

  const [newSubject, setNewSubject] = useState({
    title: '',
    category: 'فناوری',
    description: '',
  });
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .getSubjects({ limit: 50 })
      .then((res) => {
        setSubjects(res.subjects);
      })
      .catch(() => {
        toast('بارگذاری موضوعات با مشکل مواجه شد', 'error');
      });
  }, []);

  const filteredSubjects = useMemo(
    () =>
      subjects
        .filter(
          (s) =>
            s.title.includes(searchQuery) ||
            s.slug.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 5),
    [searchQuery, subjects],
  );

  const handleSelectSubject = (subject: SubjectDTO) => {
    setSelectedSubject(subject);
    setSearchQuery(subject.title);
    setShowDropdown(false);
    setShowNewSubject(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedSubject && !showNewSubject) {
      newErrors.subject =
        'لطفاً یک موضوع را انتخاب کنید یا موضوع جدید ایجاد کنید';
    }
    if (showNewSubject && !newSubject.title.trim()) {
      newErrors.title = 'عنوان موضوع جدید الزامی است';
    }
    if (!comment.trim()) {
      newErrors.comment = 'نوشتن تجربه الزامی است';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);

    try {
      let subjectId: string;

      if (showNewSubject) {
        const created = await api.createSubject({
          title: newSubject.title.trim(),
          description: newSubject.description.trim() || undefined,
          category: newSubject.category,
        });
        subjectId = created.id;
      } else {
        subjectId = selectedSubject!.id;
      }

      await api.createExperience({
        content: comment.trim(),
        rating,
        subjectId,
      });

      toast('تجربه شما با موفقیت ثبت شد!', 'success');
      router.push(`/place/${subjectId}`);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : 'ثبت تجربه با خطا مواجه شد',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-700 antialiased"
      dir="rtl"
    >
      <Meta
        title="ثبت تجربه جدید - ویکی‌نظر"
        description="تجربه خودتون رو با دیگران به اشتراک بذارید."
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
            ثبت تجربه جدید
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            تجربه خودت رو به اشتراک بذار
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-600">
            با ثبت تجربیاتت، به دیگران کمک کن تا انتخاب‌های بهتری داشته باشن. هر
            تجربه می‌تونه برای کسی مفید باشه.
          </p>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="border-b border-gray-200 bg-white py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Left Column - Form (2/3 width) */}
            <div className="md:col-span-2">
              <h2 className="mb-6 text-xl font-extrabold tracking-tight text-gray-900">
                فرم ثبت تجربه
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject Selection */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    انتخاب موضوع
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedSubject(null);
                        setShowDropdown(true);
                        setShowNewSubject(false);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="نام موضوع را جستجو کنید..."
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:shadow-sm focus:outline-none"
                    />
                    {showDropdown && searchQuery && !selectedSubject && (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-300 bg-white p-1.5 shadow-lg">
                        {filteredSubjects.length > 0 ? (
                          filteredSubjects.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSelectSubject(s)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-700 transition-all hover:bg-teal-50"
                            >
                              <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[9px] text-teal-600">
                                {s.category}
                              </span>
                              {s.title}
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-2 text-xs text-gray-500">
                            نتیجه‌ای یافت نشد
                          </p>
                        )}
                        <div className="border-t border-gray-200 pt-1">
                          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-600 transition-all hover:bg-teal-50">
                            <input
                              type="checkbox"
                              checked={showNewSubject}
                              onChange={() => {
                                setShowNewSubject((p) => !p);
                                setSelectedSubject(null);
                                setSearchQuery('');
                                setShowDropdown(false);
                              }}
                              className="size-3.5 rounded border-gray-300 text-teal-600 accent-teal-500"
                            />
                            موضوع من در لیست نیست
                          </label>
                        </div>
                      </div>
                    )}
                    {selectedSubject && (
                      <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2">
                        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-teal-600">
                          {selectedSubject.category}
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          {selectedSubject.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubject(null);
                            setSearchQuery('');
                          }}
                          className="mr-auto text-gray-500 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* New Subject Form */}
                {showNewSubject && (
                  <div className="space-y-4 rounded-xl border border-dashed border-teal-200 bg-teal-50/30 p-4">
                    <h3 className="text-base font-bold text-gray-800">
                      ایجاد موضوع جدید
                    </h3>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        عنوان <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newSubject.title}
                        onChange={(e) =>
                          setNewSubject((p) => ({
                            ...p,
                            title: e.target.value,
                          }))
                        }
                        placeholder="مثال: تجربه استفاده از محصول X"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:outline-none"
                      />
                      {errors.title && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.title}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        دسته‌بندی
                      </label>
                      <select
                        value={newSubject.category}
                        onChange={(e) =>
                          setNewSubject((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-teal-300 focus:outline-none"
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        توضیحات
                      </label>
                      <textarea
                        value={newSubject.description}
                        onChange={(e) =>
                          setNewSubject((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="توضیح مختصری درباره موضوع"
                        rows={2}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Experience Form */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-gray-800">
                    تجربه شما
                  </h3>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                      امتیاز شما
                    </label>
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                      توضیحات تجربه <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="تجربه خودت رو بنویس..."
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:shadow-sm focus:outline-none"
                    />
                    {errors.comment && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.comment}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
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
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setUploadedImages((prev) => [...prev, url]);
                              toast('عکس با موفقیت آپلود شد', 'success');
                            }
                          }}
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
                              onClick={() =>
                                setUploadedImages((prev) =>
                                  prev.filter((_, idx) => idx !== i),
                                )
                              }
                              className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-sm transition-all hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      برچسب‌ها (اختیاری، با کاما جدا کنید)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="مثال: مفید, جذاب, کاربردی"
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'در حال ثبت...' : 'ثبت تجربه'}
                </button>
              </form>
            </div>

            {/* Right Column - Tips & User Info */}
            <div className="space-y-6">
              {/* Tips Box */}
              <div className="rounded-xl border border-teal-100 bg-gradient-to-b from-teal-50/50 to-white p-5">
                <h3 className="mb-4 flex items-center gap-1.5 text-base font-bold text-teal-800">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  نکات مهم برای نوشتن تجربه
                </h3>
                <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
                  {[
                    'تجربه خود را صادقانه و دقیق بنویسید',
                    'به جزئیات مهم اشاره کنید',
                    'از نوشتن اطلاعات شخصی خودداری کنید',
                    'تصاویر مرتبط با تجربه خود اضافه کنید',
                    'به دیگران در انتخاب بهتر کمک کنید',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-cyan-400" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* User Info */}
              {user && (
                <div className="rounded-xl border border-gray-300 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      loading="lazy"
                      className="size-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {user.points} امتیاز
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white">
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <svg
                className="size-5 text-teal-500"
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
            </div>
            <p className="text-xs text-gray-500">
              &copy; Copyright {new Date().getFullYear()} ویکی‌نظر. تمامی حقوق
              محفوظ است.
            </p>
            <div className="flex gap-4 text-xs text-gray-500">
              <Link href="/" className="transition-colors hover:text-teal-600">
                درباره ما
              </Link>
              <Link href="/" className="transition-colors hover:text-teal-600">
                حریم خصوصی
              </Link>
              <Link href="/" className="transition-colors hover:text-teal-600">
                قوانین
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { SubmitExperience };
