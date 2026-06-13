import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Meta } from '../layout/Meta';
import { api } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { ClickableImage } from '../utils/ClickableImage';
import { useToast } from '../utils/ToastContext';

function toPersianNum(num: number): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return String(num).replace(
    /\d/g,
    (d) => persianDigits[parseInt(d, 10)] ?? '',
  );
}

function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const date = new Date(isoDate).getTime();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return 'چند لحظه پیش';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${toPersianNum(diffMinutes)} دقیقه پیش`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${toPersianNum(diffHours)} ساعت پیش`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${toPersianNum(diffDays)} روز پیش`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${toPersianNum(diffWeeks)} هفته پیش`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${toPersianNum(diffMonths)} ماه پیش`;

  const diffYears = Math.floor(diffDays / 365);
  return `${toPersianNum(diffYears)} سال پیش`;
}

const fallbackImage =
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400';
const fallbackAvatar =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100';

const AllSubjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<
    { id: string; name: string; icon: string }[]
  >([]);
  const [subjects, setSubjects] = useState<
    {
      id: string;
      name: string;
      nameEn: string;
      type: string;
      rating: number;
      reviews: number;
      image: string;
      description: string;
      tags: string[];
      createdAt: string;
    }[]
  >([]);
  const [experiencesList, setExperiencesList] = useState<
    {
      id: string;
      subjectId: string;
      user: string;
      avatar: string;
      rating: number;
      comment: string;
      date: string;
      likes: number;
      picture: string;
    }[]
  >([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, experiencesRes, categoriesRes] = await Promise.all([
          api.getSubjects({ limit: 100 }),
          api.getExperiences({ limit: 100 }),
          api.getCategories(),
        ]);
        setCategories(
          categoriesRes.map((c) => ({
            id: c.slug,
            name: c.name,
            icon: c.icon,
          })),
        );
        setSubjects(
          subjectsRes.subjects.map((s) => ({
            id: s.id,
            name: s.title,
            nameEn: s.slug,
            type: s.category || 'other',
            rating: 0,
            reviews: s.experienceCount,
            image: s.images?.length && s.images[0] ? s.images[0] : fallbackImage,
            description: s.description || '',
            tags: [],
            createdAt: formatRelativeTime(s.createdAt),
          })),
        );
        setExperiencesList(
          experiencesRes.experiences.map((e) => ({
            id: e.id,
            subjectId: e.subjectId,
            user: e.author?.displayName || 'کاربر',
            avatar: e.author?.avatarUrl || fallbackAvatar,
            rating: e.rating,
            comment: e.content,
            date: formatRelativeTime(e.createdAt),
            likes: e.likes,
            picture: e.images?.[0] || '',
          })),
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load data', err);
      }
    };
    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    let list = subjects;
    if (activeCategory !== 'all') {
      list = list.filter((s) => s.type === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      list = list.filter(
        (s) =>
          s.name.includes(q) ||
          s.nameEn.toLowerCase().includes(q.toLowerCase()) ||
          s.tags.some((t) => t.includes(q)),
      );
    }
    return list;
  }, [activeCategory, searchQuery, subjects]);

  const getExperiencesForSubject = (subjectId: string) =>
    experiencesList.filter((e) => e.subjectId === subjectId);

  const toggleLike = async (id: string) => {
    if (!user) {
      toast('برای پسندیدن ابتدا وارد حساب خود شوید', 'error');
      return;
    }
    try {
      const { likes } = await api.likeExperience(id);
      setExperiencesList((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, likes } : exp)),
      );
    } catch {
      toast('خطا در ثبت پسندیدن', 'error');
    }
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800" dir="rtl">
      <Meta
        title="همه موضوعات - ویکی‌نظر"
        description="مرور همه موضوعاتی که درباره‌شون تجربه ثبت شده"
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 border-b border-gray-300 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-gray-900"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-bold text-white shadow-sm">
              و
            </div>
            ویکی‌نظر
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/submit"
              className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-600"
            >
              ثبت تجربه
            </Link>
            <span className="text-xs text-gray-500">
              {filteredSubjects.length} موضوع
            </span>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex gap-3">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setExpandedSubject(null);
                }}
                placeholder="جستجوی موضوع..."
                className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2.5 pr-10 text-sm text-gray-800 placeholder:text-gray-500 focus:border-teal-400 focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
            <select
              value={activeCategory}
              onChange={(e) => {
                setActiveCategory(e.target.value);
                setExpandedSubject(null);
              }}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-teal-400 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category pills */}
          <div className="scrollbar-hide flex gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedSubject(null);
                }}
                className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed - Subject Cards with inline experiences */}
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        {filteredSubjects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-20 text-center">
            <span className="text-4xl">🔍</span>
            <p className="text-sm font-bold text-gray-700">
              نتیجه‌ای یافت نشد!
            </p>
            <p className="text-xs text-gray-500">با فیلترهای دیگه امتحان کن</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-600"
            >
              حذف فیلترها
            </button>
          </div>
        ) : (
          filteredSubjects.map((subject) => {
            const subExperiences = getExperiencesForSubject(subject.id);
            const isExpanded = expandedSubject === subject.id;

            return (
              <div
                key={subject.id}
                className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Subject Card Header - clickable */}
                <button
                  onClick={() =>
                    setExpandedSubject(isExpanded ? null : subject.id)
                  }
                  className="flex w-full items-center gap-4 p-4 text-right transition-colors hover:bg-gray-50"
                >
                  <ClickableImage
                    src={subject.image}
                    alt={subject.name}
                    className="size-20 shrink-0 rounded-xl object-cover shadow-sm"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-gray-900">
                        {subject.name}
                      </h3>
                      <span className="shrink-0 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                        {categories.find((c) => c.id === subject.type)?.name ||
                          subject.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {subject.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-amber-500">★</span>
                        <span className="text-sm font-bold text-gray-800">
                          {subject.rating}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {subject.reviews} تجربه
                      </span>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-[10px] text-gray-500">
                        {subject.createdAt}
                      </span>
                      <div className="flex gap-1.5">
                        {subject.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/submit?subjectId=${subject.id}`}
                      className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm transition-all hover:from-teal-600 hover:to-cyan-600"
                    >
                      ثبت تجربه
                    </Link>
                    <svg
                      className={`size-6 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Expanded Experiences */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {subExperiences.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-500">
                          هنوز تجربه‌ای ثبت نشده
                        </p>
                        <Link
                          href={`/subject/${subject.id}`}
                          className="mt-2 inline-block text-xs font-semibold text-teal-600 hover:text-teal-700"
                        >
                          اولین نفری باش که تجربه‌ش رو ثبت می‌کنه →
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {subExperiences.map((exp) => (
                          <div key={exp.id} className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={exp.avatar}
                                  alt={exp.user}
                                  className="size-8 rounded-full object-cover"
                                />
                                <div>
                                  <span className="text-sm font-semibold text-gray-800">
                                    {exp.user}
                                  </span>
                                  <span className="mr-2 text-xs text-gray-500">
                                    {exp.date}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-amber-500">
                                  ★
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                  {exp.rating}
                                </span>
                              </div>
                            </div>
                            <p className="pr-10 text-sm leading-relaxed text-gray-700">
                              {exp.comment}
                            </p>
                            {exp.picture && (
                              <div className="mt-2 pr-10">
                                <ClickableImage
                                  src={exp.picture}
                                  alt="تصویر تجربه"
                                  className="max-h-40 w-full rounded-lg object-cover"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-4 pr-10">
                              <button
                                onClick={() => toggleLike(exp.id)}
                                className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                                  likedPosts.has(exp.id)
                                    ? 'text-red-500'
                                    : 'text-gray-500 hover:text-red-500'
                                }`}
                              >
                                <svg
                                  className="size-4"
                                  fill={
                                    likedPosts.has(exp.id)
                                      ? 'currentColor'
                                      : 'none'
                                  }
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                                {exp.likes + (likedPosts.has(exp.id) ? 1 : 0)}
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    typeof navigator !== 'undefined' &&
                                    navigator.share
                                  ) {
                                    navigator.share({
                                      title: subject.name,
                                      text: exp.comment,
                                    });
                                  }
                                }}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-teal-600"
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
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                  />
                                </svg>
                                اشتراک
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {subExperiences.length > 0 && (
                      <Link
                        href={`/subject/${subject.id}`}
                        className="flex items-center justify-center gap-1.5 border-t border-gray-200 py-3 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-50"
                      >
                        مشاهده همه {subExperiences.length} تجربه
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export { AllSubjects };
