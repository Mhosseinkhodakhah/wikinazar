import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { LoginModal } from '../components/LoginModal';
import {
  api,
  type CategoryDTO,
  type ExperienceDTO,
  type SubjectDTO,
} from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'همین الان';
  if (diffMin < 60) return `${diffMin} دقیقه پیش`;
  if (diffHour < 24) return `${diffHour} ساعت پیش`;
  if (diffDay === 1) return 'دیروز';
  if (diffDay < 7) return `${diffDay} روز پیش`;
  if (diffWeek < 5) return `${diffWeek} هفته پیش`;
  if (diffMonth < 12) return `${diffMonth} ماه پیش`;
  return `${Math.floor(diffDay / 365)} سال پیش`;
}

const fallbackImage =
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400';
const fallbackAvatar =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100';

type MappedSubject = {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  tags: string[];
};

type MappedExperience = {
  id: string;
  subjectId: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
};

const MobileFeed = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<MappedSubject[]>([]);
  const [experiences, setExperiences] = useState<MappedExperience[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string; icon: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, experiencesRes, categoriesRes] = await Promise.all([
          api.getSubjects({ limit: 50 }),
          api.getExperiences({ limit: 50 }),
          api.getCategories(),
        ]);
        setCategories(
          categoriesRes.map((c: CategoryDTO) => ({
            id: c.slug,
            name: c.name,
            icon: c.icon,
          })),
        );
        setSubjects(
          subjectsRes.subjects.map((s: SubjectDTO) => ({
            id: s.id,
            name: s.title,
            nameEn: s.slug,
            type: s.category || 'other',
            rating: 0,
            reviews: s.experienceCount,
            image: s.icon || fallbackImage,
            description: s.description || '',
            tags: [],
          })),
        );
        setExperiences(
          experiencesRes.experiences.map((e: ExperienceDTO) => ({
            id: e.id,
            subjectId: e.subjectId,
            user: e.author?.displayName || e.author?.username || 'کاربر',
            avatar: e.author?.avatarUrl || fallbackAvatar,
            rating: e.rating,
            comment: e.content,
            date: formatRelativeTime(e.createdAt),
            likes: e.likes,
          })),
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load feed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    let list = subjects;
    if (activeCategory !== 'all') {
      list = list.filter((s) => s.type === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim();
      list = list.filter(
        (s) =>
          s.name.includes(q) ||
          s.nameEn.toLowerCase().includes(q.toLowerCase()) ||
          s.tags.some((t) => t.includes(q)),
      );
    }
    return list;
  }, [activeCategory, search, subjects]);

  const getExperiencesForSubject = (subjectId: string) =>
    experiences.filter((e) => e.subjectId === subjectId);

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  const toggleLike = async (id: string) => {
    try {
      const { likes } = await api.likeExperience(id);
      setExperiences((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, likes } : exp)),
      );
    } catch {
      // silent fail
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-bold text-white shadow-sm">
              و
            </div>
            <span className="text-base font-bold text-gray-900">ویکی‌نظر</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="size-8 rounded-full border-2 border-teal-300 object-cover"
                />
              </Link>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-600"
              >
                ورود
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی موضوعات..."
              className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2.5 pr-10 text-sm text-gray-800 placeholder:text-gray-500 focus:border-teal-400 focus:bg-white focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="scrollbar-hide flex gap-1.5 overflow-x-auto px-4 pb-3">
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

      {/* Feed - Subject Cards with Comment Sections */}
      <div className="space-y-3 p-3">
        {(() => {
          if (loading) {
            return (
              <div className="flex items-center justify-center py-16">
                <div className="size-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-500" />
              </div>
            );
          }
          if (filteredSubjects.length === 0) {
            return (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-20 text-center">
                <span className="text-4xl">🔍</span>
                <p className="text-sm font-bold text-gray-700">
                  نتیجه‌ای یافت نشد!
                </p>
                <p className="text-xs text-gray-500">
                  با فیلترهای دیگه امتحان کن
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearch('');
                  }}
                  className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-600"
                >
                  حذف فیلترها
                </button>
              </div>
            );
          }
          return filteredSubjects.map((subject) => {
            const subExperiences = getExperiencesForSubject(subject.id);
            const isExpanded = expandedSubject === subject.id;

            return (
              <div
                key={subject.id}
                className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm"
              >
                {/* Subject Card Header */}
                <div
                  onClick={() =>
                    setExpandedSubject(isExpanded ? null : subject.id)
                  }
                  className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-gray-50"
                >
                  <img
                    src={subject.image}
                    alt={subject.name}
                    className="size-16 shrink-0 rounded-xl object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900">
                        {subject.name}
                      </h3>
                      <span className="shrink-0 rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                        {getCategoryName(subject.type)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {subject.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        <span className="text-xs text-amber-500">★</span>
                        <span className="text-xs font-bold text-gray-800">
                          {subject.rating}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {subExperiences.length} تجربه
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`size-5 shrink-0 text-gray-500 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
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

                {/* Expanded Comments Section */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {subExperiences.length === 0 ? (
                      <div className="px-3 py-6 text-center">
                        <p className="text-xs text-gray-500">
                          هنوز تجربه‌ای ثبت نشده
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {subExperiences.map((exp) => (
                          <div key={exp.id} className="p-3">
                            <div className="mb-1.5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={exp.avatar}
                                  alt={exp.user}
                                  className="size-7 rounded-full object-cover"
                                />
                                <span className="text-xs font-semibold text-gray-800">
                                  {exp.user}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  {exp.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-amber-500">
                                  ★
                                </span>
                                <span className="text-xs font-bold text-gray-800">
                                  {exp.rating}
                                </span>
                              </div>
                            </div>
                            <p className="pr-9 text-xs leading-relaxed text-gray-700">
                              {exp.comment}
                            </p>
                            <div className="mt-1.5 flex items-center gap-3 pr-9">
                              <button
                                onClick={() => toggleLike(exp.id)}
                                className="flex items-center gap-1 text-[10px] font-medium text-gray-500 hover:text-red-500"
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
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                                {exp.likes}
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
                                className="flex items-center gap-1 text-[10px] font-medium text-gray-500 hover:text-teal-600"
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

                    {/* View All Link */}
                    {subExperiences.length > 0 && (
                      <Link
                        href={`/subject/${subject.id}`}
                        className="flex items-center justify-center gap-1 border-t border-gray-200 py-2.5 text-[11px] font-semibold text-teal-600 transition-colors hover:bg-teal-50"
                      >
                        مشاهده همه {subExperiences.length} تجربه
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export { MobileFeed };
