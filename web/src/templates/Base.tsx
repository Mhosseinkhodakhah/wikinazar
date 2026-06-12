import Link from 'next/link';
import { useRouter } from 'next/router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LoginModal } from '../components/LoginModal';
import { Meta } from '../layout/Meta';
import type { ExperienceDTO, RequestDTO, SubjectDTO } from '../utils/api';
import { api } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { Lightbox } from '../utils/Lightbox';
import { SkeletonCard } from '../utils/Skeleton';
import { useToast } from '../utils/ToastContext';
import { useDebounce } from '../utils/useDebounce';
import { useMobile } from '../utils/useMobile';
import { Footer } from './Footer';
import { MobileFeed } from './MobileFeed';

const badges = [
  {
    min: 100,
    label: 'کارشناس تجربه',
    icon: '👑',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    min: 50,
    label: 'تجربه‌نگار',
    icon: '🏅',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    min: 10,
    label: 'تازه‌کار',
    icon: '⭐',
    color: 'text-green-600 bg-green-50',
  },
];

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
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'همین الان';
  if (diffMin < 60) return `${diffMin} دقیقه پیش`;
  if (diffHour < 24) return `${diffHour} ساعت پیش`;
  if (diffDay === 1) return 'دیروز';
  if (diffDay < 7) return `${diffDay} روز پیش`;
  if (diffWeek < 5) return `${diffWeek} هفته پیش`;
  if (diffMonth < 12) return `${diffMonth} ماه پیش`;
  return `${diffYear} سال پیش`;
}

const shareContent = (name: string) => {
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator
      .share({
        title: name,
        text: `${name} - ویکی‌نظر`,
        url: window.location.href,
      })
      .catch(() => {});
  }
};

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
  featured: boolean;
  createdAt: string;
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
  picture: string;
};

type MappedRequest = {
  id: string;
  title: string;
  description: string;
  category: string;
  requestedBy: string;
  date: string;
  votes: number;
  status: string;
};

const SearchSuggestions = memo(function SearchSuggestions({
  searchQuery,
  searchHistory,
  searchResults,
  searchLoading,
  onSelect,
  onClose,
  show,
}: {
  searchQuery: string;
  searchHistory: string[];
  searchResults: MappedSubject[];
  searchLoading: boolean;
  onSelect: (q: string) => void;
  onClose: () => void;
  show: boolean;
}) {
  if (
    !show ||
    (!searchQuery &&
      searchHistory.length === 0 &&
      !searchLoading &&
      searchResults.length === 0)
  )
    return null;

  const matchedHistory = searchQuery
    ? searchHistory.filter((s) => s.includes(searchQuery))
    : [];

  return (
    <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-300 bg-white p-2 shadow-lg">
      {matchedHistory.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-700 transition-all hover:bg-teal-50"
        >
          🕐 {s}
        </button>
      ))}
      {searchLoading && (
        <div className="flex items-center justify-center py-3">
          <div className="size-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      )}
      {searchResults.map((p) => (
        <Link
          key={p.id}
          href={`/subject/${p.id}`}
          onClick={() => {
            const updated = [
              p.name,
              ...searchHistory.filter((s) => s !== p.name),
            ].slice(0, 5);
            localStorage.setItem('searchHistory', JSON.stringify(updated));
            onClose();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-700 transition-all hover:bg-teal-50"
        >
          📍 {p.name}
        </Link>
      ))}
      <button
        onClick={onClose}
        className="mt-1 w-full text-center text-[10px] text-gray-500 hover:text-gray-700"
      >
        بستن
      </button>
    </div>
  );
});

const Base = ({ showLoginByDefault }: { showLoginByDefault?: boolean }) => {
  const isMobile = useMobile();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedApiSearch = useDebounce(searchQuery, 3000);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<MappedSubject[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [, setUserLat] = useState(0);
  const [, setUserLon] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(6);

  const [categories, setCategories] = useState<
    { id: string; name: string; icon: string }[]
  >([]);
  const [subjects, setSubjects] = useState<MappedSubject[]>([]);
  const [experiences, setExperiences] = useState<MappedExperience[]>([]);
  const [requests, setRequests] = useState<MappedRequest[]>([]);
  const [stats, setStats] = useState([
    { value: '۰', label: 'موضوع', icon: '📋' },
    { value: '۰', label: 'th; th;', icon: '💬' },
    { value: '۰', label: 'درخواست', icon: '📝' },
    { value: '۰', label: 'میانگین امتیاز', icon: '⭐' },
  ]);

  const filteredSubjects = useMemo(
    () =>
      subjects
        .filter((s) => activeTab === 'all' || s.type === activeTab)
        .filter(
          (s) =>
            !debouncedSearchQuery ||
            s.name.includes(debouncedSearchQuery) ||
            s.nameEn.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
        ),
    [subjects, activeTab, debouncedSearchQuery],
  );

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

  const mapSubject = (s: SubjectDTO): MappedSubject => ({
    id: s.id,
    name: s.title,
    nameEn: s.slug,
    type: s.category || 'other',
    rating: 0,
    reviews: s.experienceCount,
    image:
      s.icon ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(s.title)}&background=teal&color=fff`,
    description: s.description || '',
    tags: [],
    featured: false,
    createdAt: formatRelativeTime(s.createdAt),
  });

  const mapExperience = (e: ExperienceDTO): MappedExperience => ({
    id: e.id,
    subjectId: e.subjectId,
    user: e.author?.displayName || e.author?.username || 'کاربر',
    avatar: e.author?.avatarUrl || '',
    rating: e.rating,
    comment: e.content,
    date: formatRelativeTime(e.createdAt),
    likes: e.likes,
    picture: e.images?.[0] || '',
  });

  const mapRequest = (r: RequestDTO): MappedRequest => ({
    id: r.id,
    title: r.title,
    description: r.description || '',
    category: r.category || 'other',
    requestedBy: r.requester?.displayName || r.requester?.username || 'کاربر',
    date: formatRelativeTime(r.createdAt),
    votes: r.votes,
    status: r.status,
  });

  const userBadges = useMemo(() => {
    const expCountByUser: Record<string, number> = {};
    experiences.forEach((e) => {
      expCountByUser[e.user] = (expCountByUser[e.user] || 0) + 1;
    });
    const result: Record<string, number> = {};
    experiences.forEach((e) => {
      result[e.id] = (expCountByUser[e.user] || 0) * 10;
    });
    return result;
  }, [experiences]);

  useEffect(() => {
    const h = localStorage.getItem('searchHistory');
    if (h) setSearchHistory(JSON.parse(h));
  }, []);

  useEffect(() => {
    if (showLoginByDefault && !user) {
      setShowLogin(true);
    }
  }, [showLoginByDefault, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, experiencesRes, requestsRes, categoriesRes] =
          await Promise.all([
            api.getSubjects({ limit: 50 }),
            api.getExperiences({ limit: 20 }),
            api.getRequests({ limit: 10 }),
            api.getCategories(),
          ]);
        setCategories(
          categoriesRes.map((c) => ({
            id: c.slug,
            name: c.name,
            icon: c.icon,
          })),
        );

        const mappedSubjects = subjectsRes.subjects.map(mapSubject);
        const mappedExperiences = experiencesRes.experiences.map(mapExperience);
        const mappedRequests = requestsRes.requests.map(mapRequest);

        setSubjects(mappedSubjects);
        setExperiences(mappedExperiences);
        setRequests(mappedRequests);

        const totalRating = mappedExperiences.reduce(
          (sum, e) => sum + e.rating,
          0,
        );
        const avgRating =
          mappedExperiences.length > 0
            ? totalRating / mappedExperiences.length
            : 0;

        setStats([
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
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch data', err);
        toast('خطا در دریافت اطلاعات', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!debouncedApiSearch.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }
    let cancelled = false;
    setSearchLoading(true);
    api
      .getSubjects({ search: debouncedApiSearch, limit: 5 })
      .then((res) => {
        if (!cancelled) setSearchResults(res.subjects.map(mapSubject));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedApiSearch]);

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...searchHistory.filter((s) => s !== q)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSelect = (q: string) => {
    setSearchQuery(q);
    handleSearch(q);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast('مرورگر شما از موقعیت یابی پشتیبانی نمی‌کند', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
        setNearMe(true);
        toast('موقعیت شما یافت شد!', 'success');
      },
      () => toast('دسترسی به موقعیت رد شد', 'error'),
    );
  };

  const handleSwipe = (
    direction: number,
    length: number,
    setIdx: (i: number) => void,
    idx: number,
  ) => {
    const next = (idx + direction + length) % length;
    setIdx(next);
  };

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  const heroSection = (
    <div
      id="main-content"
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[20%] size-[300px] rounded-full bg-teal-100/60 blur-[100px] md:size-[400px]" />
        <div className="absolute right-[10%] top-[30%] size-[250px] rounded-full bg-cyan-100/60 blur-[100px] md:size-[350px]" />
        <div className="absolute bottom-[15%] left-[30%] size-[200px] rounded-full bg-emerald-100/50 blur-[80px] md:size-[300px]" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs text-gray-600 shadow-sm md:gap-2 md:px-5 md:py-2 md:text-sm">
          <span className="size-1.5 rounded-full bg-teal-400" />
          به تازگی {stats[1]!.value} تجربه ثبت شده - تو هم تجربه‌ات رو به اشتراک
          بذار!
        </div>
        <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 md:mb-6 md:text-6xl">
          به{' '}
          <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            ویکی‌نظر
          </span>{' '}
          خوش آمدید
        </h1>
        <p className="mb-8 max-w-xl text-sm leading-relaxed text-gray-600 md:mb-10 md:text-base">
          قبل از هر انتخابی، تجربه دیگران را ببین
        </p>
        <div className="mb-4 w-full max-w-md md:mb-6">
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white p-1.5 shadow-lg shadow-black/5 transition-all duration-300 focus-within:border-teal-300 focus-within:shadow-teal-200/50">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="اسم موضوع مورد نظرت رو بنویس..."
                className="flex-1 rounded-lg bg-gray-50 px-4 py-3 text-right text-sm text-gray-700 placeholder:text-gray-500 focus:outline-none"
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                aria-label="جستجوی موضوع"
                className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-md active:scale-95"
              >
                بگرد
              </button>
            </div>
            <SearchSuggestions
              show={showSuggestions}
              searchQuery={searchQuery}
              searchHistory={searchHistory}
              searchResults={searchResults}
              searchLoading={searchLoading}
              onSelect={handleSelect}
              onClose={() => setShowSuggestions(false)}
            />
          </div>
        </div>
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={handleNearMe}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium shadow-sm transition-all md:px-4 md:py-2 md:text-sm ${
              nearMe
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            📍 {nearMe ? 'موقعیت فعال' : 'نزدیک‌ترین‌ها'}
          </button>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/50 px-5 py-2.5 text-xs font-semibold text-teal-700 shadow-sm transition-all duration-300 hover:border-teal-300 hover:bg-teal-100 hover:shadow-md md:px-6 md:py-3 md:text-sm"
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
            ثبت تجربه جدید
          </Link>
          <Link
            href="/request"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600 md:px-6 md:py-3 md:text-sm"
          >
            📝 درخواست موضوع
          </Link>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-md md:px-6 md:py-3 md:text-sm"
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            برو به نظرات
          </Link>
          {user ? (
            <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 shadow-sm">
              <img
                src={user.avatar}
                alt={user.name}
                loading="lazy"
                className="size-6 rounded-full object-cover"
              />
              <span className="text-xs font-semibold text-gray-700">
                {user.name}
              </span>
              <Link
                href="/dashboard"
                className="mr-1 rounded-lg bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 transition-all hover:bg-teal-100"
              >
                داشبورد
              </Link>
              <button
                onClick={() => {
                  logout();
                  setShowLogin(false);
                }}
                className="mr-1 text-[10px] text-gray-500 hover:text-red-500"
              >
                خروج
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600 md:px-6 md:py-3 md:text-sm"
            >
              🔐 ورود
            </button>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-100 to-transparent md:h-32" />
    </div>
  );

  const StatsBar = () => (
    <div className="relative z-10 mx-auto -mt-12 max-w-5xl px-4 md:-mt-16">
      <div className="grid grid-cols-2 divide-x divide-gray-200 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-lg md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 text-center transition-colors hover:bg-teal-50/50 md:p-6"
          >
            <div className="mb-1 text-xl md:mb-2 md:text-2xl">{stat.icon}</div>
            <div className="text-base font-bold text-gray-800 md:text-lg">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 md:text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const CategoryGrid = () => (
    <div className="border-b border-gray-200 bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:mb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-500 md:text-xs">
            دسته‌بندی‌ها
          </span>
          <h2 className="mt-3 text-xl font-bold text-gray-900 md:mt-4 md:text-3xl">
            بر اساس دسته‌بندی جستجو کن
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-gray-600 md:text-sm">
            موضوع مورد علاقه‌ات رو انتخاب کن و تجربه دیگران رو ببین
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2 md:grid-cols-9 md:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              aria-label={`دسته‌بندی ${cat.name}`}
              className={`rounded-xl border p-3 text-center transition-all duration-300 md:p-5 ${
                activeTab === cat.id
                  ? 'border-teal-200 bg-gradient-to-b from-teal-50 to-white text-teal-600 shadow-md'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-teal-200 hover:bg-teal-50/50 hover:text-gray-700'
              }`}
            >
              <div className="mb-1 text-lg md:mb-2 md:text-2xl">{cat.icon}</div>
              <div className="text-[10px] font-semibold md:text-sm">
                {cat.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const SubjectCard = ({
    subject,
    compact,
  }: {
    subject: MappedSubject;
    compact?: boolean;
  }) => (
    <div
      className={`group overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        compact
          ? 'border-black shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
          : 'border-gray-300'
      }`}
    >
      <div className="relative">
        <button
          onClick={() => setLightboxImg(subject.image)}
          className="w-full"
        >
          <img
            src={subject.image}
            alt={subject.name}
            loading="lazy"
            className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              compact ? 'h-24 md:h-28' : 'h-36 md:h-44'
            }`}
          />
        </button>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {subject.featured && (
          <div className="absolute right-2 top-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow md:right-3 md:top-3 md:px-2.5 md:py-1 md:text-xs">
            داغ
          </div>
        )}
        <div className="absolute inset-x-2 bottom-2 flex flex-wrap gap-1 md:gap-1.5">
          <div className="rounded-lg border border-white/20 bg-black/50 px-1.5 py-0.5 text-[9px] text-white backdrop-blur-sm md:px-2 md:py-0.5 md:text-[10px]">
            {getCategoryName(subject.type)}
          </div>
          <div className="rounded-lg border border-white/20 bg-black/50 px-1.5 py-0.5 text-[9px] text-white backdrop-blur-sm md:px-2 md:py-0.5 md:text-[10px]">
            {subject.reviews} تجربه
          </div>
        </div>
      </div>
      <div className="p-2.5 md:p-3">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-gray-800 transition-colors group-hover:text-teal-600 md:text-sm">
              {subject.name}
            </h3>
            <p className="text-[10px] text-gray-500 md:text-[11px]">
              {subject.nameEn}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-teal-100 bg-teal-50 px-1.5 py-0.5">
            <span className="text-[9px] text-teal-500 md:text-[10px]">★</span>
            <span className="text-[10px] font-bold text-teal-700 md:text-xs">
              {subject.rating}
            </span>
          </div>
        </div>
        <p className="mb-1.5 text-[10px] leading-relaxed text-gray-600 md:text-[11px]">
          {subject.description}
        </p>
        <div className="mb-1.5 flex flex-wrap gap-1">
          {subject.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-gray-200 bg-gray-50 px-1 py-0.5 text-[8px] text-gray-500 md:px-1.5 md:text-[10px]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-1.5 md:pt-2">
          <Link
            href={`/subject/${subject.id}`}
            className="flex items-center gap-1 text-[10px] font-semibold text-teal-500 transition-colors hover:text-teal-600 md:text-xs"
          >
            مشاهده تجربیات
            <span className="inline-block transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href={`/submit?subjectId=${subject.id}`}
              className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-2 py-1 text-[9px] font-semibold text-white transition-all hover:from-teal-600 hover:to-cyan-600 md:px-2.5 md:text-[10px]"
            >
              ثبت تجربه
            </Link>
            <button
              onClick={() => shareContent(subject.name)}
              className="rounded-lg border border-gray-300 p-1 text-gray-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500 md:p-1.5"
            >
              <svg
                className="size-3 md:size-3.5"
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TrendingSection = () => {
    const trendingSubjects = [...subjects]
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 8);
    return (
      <div className="border-b border-gray-200 bg-gray-50 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between md:mb-10">
            <div className="flex items-center gap-2">
              <span className="animate-pulse text-lg md:text-2xl">🔥</span>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-500 md:text-xs">
                  داغ‌ترین‌ها
                </span>
                <h2 className="mt-2 text-lg font-bold text-gray-900 md:mt-3 md:text-3xl">
                  داغ‌ترین موضوعات
                </h2>
                <p className="mt-1 text-xs text-gray-600 md:mt-2 md:text-sm">
                  پرتجربه‌ترین موضوعات هفته
                </p>
              </div>
            </div>
          </div>
          <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:gap-6 md:pb-4">
            {trendingSubjects.map((subject) => (
              <div key={subject.id} className="w-[240px] shrink-0 md:w-[280px]">
                <SubjectCard subject={subject} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AllSubjects = () => (
    <div className="border-b border-gray-200 bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:mb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-500 md:text-xs">
            مرور
          </span>
          <h2 className="mt-3 text-xl font-bold text-gray-900 md:mt-4 md:text-3xl">
            همه موضوعات
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-gray-600 md:text-sm">
            از بین تجربیات دیگران جستجو کن و بهترین انتخاب رو داشته باش
          </p>
        </div>
        <div className="mb-6 flex flex-wrap justify-center gap-1.5 md:mb-8 md:gap-2">
          {categories.map((tab) => (
            <button
              key={tab.id}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 md:px-4 md:py-2 md:text-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                  : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                setVisibleCount(6);
              }}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} compact />
              ))
            : filteredSubjects.slice(0, visibleCount).map((subject) => (
                <div key={subject.id}>
                  <SubjectCard subject={subject} compact />
                </div>
              ))}
        </div>
        {!loading && filteredSubjects.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
            <span className="text-3xl">🔍</span>
            <p className="text-sm font-semibold text-gray-600">
              نتیجه‌ای یافت نشد!
            </p>
            <p className="text-xs text-gray-500">با فیلترهای دیگه امتحان کن</p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
                setVisibleCount(6);
              }}
              className="rounded-lg bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-700 transition-all hover:bg-teal-100"
            >
              حذف همه فیلترها
            </button>
          </div>
        )}
        {!loading && filteredSubjects.length > visibleCount && (
          <div className="mt-8 text-center md:mt-10">
            <Link
              href="/subjects"
              className="inline-block rounded-lg border-2 border-dashed border-gray-300 bg-white px-8 py-3 text-xs font-semibold text-gray-600 transition-all hover:border-teal-200 hover:text-teal-500 md:text-sm"
            >
              نمایش همه موضوعات ←
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const ExperiencesSection = () => {
    const CIRCLE_RADIUS = 100;
    const AVATAR_SIZE = 48;
    const topExperiences = experiences.slice(0, 6);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isRotating, setIsRotating] = useState(false);

    const goTo = useCallback(
      (idx: number) => {
        if (idx === activeIdx || isRotating) return;
        setIsRotating(true);
        setActiveIdx(idx);
        setTimeout(() => setIsRotating(false), 500);
      },
      [activeIdx, isRotating],
    );

    const next = useCallback(() => {
      goTo((activeIdx + 1) % topExperiences.length);
    }, [activeIdx, topExperiences.length, goTo]);

    useEffect(() => {
      const timer = setInterval(next, 4000);
      return () => clearInterval(timer);
    }, [next]);

    if (topExperiences.length === 0) {
      return null;
    }

    const active = topExperiences[activeIdx]!;

    return (
      <div className="border-b border-gray-200 bg-gray-50 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-500 md:text-xs">
              تجربیات تازه
            </span>
            <h2 className="mt-3 text-xl font-bold text-gray-900 md:mt-4 md:text-3xl">
              آخرین تجربیات
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-gray-600 md:text-sm">
              ببین دیگران چه تجربه‌ای دارن، بعد تو تصمیم بگیر
            </p>
          </div>

          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <div
              className="relative mb-8 flex h-[300px] w-full items-center justify-center md:mb-12 md:h-[340px]"
              role="region"
              aria-label="تجربیات کاربران"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight')
                  goTo((activeIdx + 1) % topExperiences.length);
                if (e.key === 'ArrowLeft')
                  goTo(
                    (activeIdx - 1 + topExperiences.length) %
                      topExperiences.length,
                  );
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                if (t) setTouchStart(t.clientX);
              }}
              onTouchEnd={(e) => {
                const t = e.changedTouches[0];
                if (!t) return;
                const diff = touchStart - t.clientX;
                if (Math.abs(diff) > 50)
                  handleSwipe(
                    diff > 0 ? 1 : -1,
                    topExperiences.length,
                    goTo,
                    activeIdx,
                  );
              }}
            >
              {topExperiences.map((exp, i) => {
                const total = topExperiences.length;
                const angle =
                  (i / total) * 360 - 90 - (activeIdx / total) * 360;
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * CIRCLE_RADIUS;
                const y = Math.sin(rad) * CIRCLE_RADIUS;
                const isActive = i === activeIdx;
                const distFromTop = Math.abs(y + CIRCLE_RADIUS);
                const scale = isActive
                  ? 1
                  : Math.max(
                      0.4,
                      0.55 +
                        ((CIRCLE_RADIUS - distFromTop) / CIRCLE_RADIUS) * 0.3,
                    );
                const zIndex = isActive ? 50 : Math.floor(20 - y / 8);

                return (
                  <button
                    key={exp.id}
                    onClick={() => goTo(i)}
                    className="absolute left-1/2 top-1/2 transition-all duration-500 ease-out"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`,
                      zIndex,
                    }}
                  >
                    <div
                      className={`overflow-hidden rounded-xl border-2 transition-all duration-500 ${
                        isActive
                          ? 'border-teal-500 shadow-lg shadow-teal-200/50'
                          : 'border-gray-300 shadow-md hover:border-teal-300'
                      }`}
                      style={{
                        width: isActive ? AVATAR_SIZE + 8 : AVATAR_SIZE,
                        height: isActive ? AVATAR_SIZE + 8 : AVATAR_SIZE,
                      }}
                    >
                      <img
                        src={exp.avatar}
                        alt={exp.user}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    {isActive && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-teal-600 md:text-xs">
                        {exp.user}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="w-full max-w-md rounded-2xl border border-gray-300 bg-white p-5 shadow-lg transition-all duration-500 md:p-6">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-gray-900 md:text-base">
                    {active.user}
                    {(() => {
                      const pts = userBadges[active.id] ?? 0;
                      const foundBadge = badges.find(
                        (badge) => pts >= badge.min,
                      );
                      return foundBadge ? (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium ${foundBadge.color}`}
                        >
                          {foundBadge.icon} {foundBadge.label}
                        </span>
                      ) : null;
                    })()}
                  </h4>
                  <p className="text-[11px] text-gray-500 md:text-xs">
                    {subjects.find((s) => s.id === active.subjectId)?.name ??
                      ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-teal-50 px-2 py-1">
                  <span className="text-[10px] text-teal-500 md:text-xs">
                    ★
                  </span>
                  <span className="text-xs font-bold text-teal-700 md:text-sm">
                    {active.rating}
                  </span>
                </div>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-gray-700 md:text-base">
                &ldquo;{active.comment}&rdquo;
              </p>
              {active.picture && (
                <div className="mb-3">
                  <img
                    src={active.picture}
                    alt="تصویر تجربه"
                    className="max-h-40 rounded-lg object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-[11px] text-gray-500 md:text-sm">
                <span className="flex items-center gap-1">
                  <svg
                    className="size-3 md:size-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {active.date}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => shareContent(active.user)}
                    className="transition-colors hover:text-blue-500"
                  >
                    <svg
                      className="size-3 md:size-3.5"
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
                  </button>
                  <button className="group flex items-center gap-1 transition-colors hover:text-red-500">
                    <svg
                      className="size-3 transition-transform group-hover:scale-110 md:size-3.5"
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
                    <span>{active.likes}</span>
                  </button>
                </div>
              </div>
            </div>

            <div
              className="mt-6 flex items-center gap-2"
              role="tablist"
              aria-label="انتخاب تجربه"
            >
              {topExperiences.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`رفتن به تجربه ${i + 1}`}
                  role="tab"
                  aria-selected={i === activeIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIdx
                      ? 'w-6 bg-gradient-to-r from-teal-500 to-cyan-500'
                      : 'w-1.5 bg-black/20 hover:bg-black/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 md:flex-row md:justify-center md:gap-4">
            <Link
              href="/submit"
              className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg active:scale-95"
            >
              ثبت تجربه جدید
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const RequestSection = () => (
    <div className="border-b border-gray-200 bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:mb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-500 md:text-xs">
            درخواست‌ها
          </span>
          <h2 className="mt-3 text-xl font-bold text-gray-900 md:mt-4 md:text-3xl">
            درخواست‌های ثبت‌نشده
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-gray-600 md:text-sm">
            موضوعاتی که کاربران منتظر تجربه شما هستند
          </p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-4 md:gap-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="group rounded-xl border border-gray-300 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md md:p-6"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 md:text-base">
                    {req.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-gray-600 md:text-xs">
                    {req.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-medium text-teal-600">
                  👍 {req.votes}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 text-[10px] text-gray-500 md:pt-3 md:text-xs">
                <div className="flex items-center gap-2">
                  <span>{getCategoryName(req.category)}</span>
                  <span className="size-1 rounded-full bg-gray-300" />
                  <span>{req.date}</span>
                  <span className="size-1 rounded-full bg-gray-300" />
                  <span>{req.requestedBy}</span>
                </div>
                <Link
                  href={`/submit?subject=${encodeURIComponent(req.title)}`}
                  className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm transition-all hover:from-teal-600 hover:to-cyan-600 md:px-4 md:py-2 md:text-xs"
                >
                  ثبت تجربه
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/requests"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
          >
            مشاهده همه درخواست‌ها
            <span>←</span>
          </Link>
        </div>
      </div>
    </div>
  );

  const CTASection = () => (
    <div className="relative overflow-hidden border-b border-gray-300 bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-10 size-48 rounded-full bg-white/10 blur-3xl md:size-64" />
        <div className="absolute bottom-10 right-1/4 size-56 rounded-full bg-white/10 blur-3xl md:size-80" />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDYiLz48L3N2Zz4=')]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-white/90 backdrop-blur-md md:mb-6 md:gap-2 md:px-5 md:py-2 md:text-sm">
          به جمع ما بپیوندید
        </div>
        <h2 className="mb-3 text-2xl font-bold text-white md:mb-4 md:text-4xl">
          تجربه خودت رو با دیگران به اشتراک بذار
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-white/80 md:mb-10 md:text-base">
          با ثبت تجربه‌ات به دیگران کمک کن بهترین انتخاب رو داشته باشن
        </p>
        <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:gap-4">
          <Link
            href="/submit"
            className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-teal-600 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gray-50 hover:shadow-xl active:scale-95 md:px-10 md:py-3.5 md:text-base"
          >
            ثبت تجربه جدید
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-white/30 px-8 py-3 text-sm font-semibold text-white/90 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:text-white active:scale-95 md:px-10 md:py-3.5 md:text-base"
          >
            درباره ما
          </Link>
        </div>
      </div>
    </div>
  );

  const Banner = () => (
    <div className="relative flex items-center justify-between overflow-hidden border-b border-teal-100 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 py-2.5 md:py-3">
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4">
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-white/90 md:gap-2 md:text-sm">
          <span>🎉</span>
          <span>
            به تازگی{' '}
            <span className="font-bold text-white">
              {stats[1]!.value} تجربه
            </span>{' '}
            ثبت شده – تو هم تجربه‌ات رو به اشتراک بذار!
          </span>
        </p>
        <button
          onClick={() => setDarkMode((p) => !p)}
          className="relative z-10 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/90 transition-all hover:bg-white/20 md:px-4 md:py-1.5 md:text-xs"
        >
          {darkMode ? '🌙 روشن' : '☀️ تیره'}
        </button>
      </div>
    </div>
  );

  const LoginModalComponent = () => (
    <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
  );

  const RecommendedSection = () => {
    let preferredCategory = 'all';
    if (user?.id === '1') preferredCategory = 'tech';
    else if (user?.id === '2') preferredCategory = 'food';
    const recs = subjects
      .filter(
        (s) => preferredCategory === 'all' || s.type === preferredCategory,
      )
      .filter((s) => s.featured)
      .slice(0, 4);
    if (!user || recs.length === 0) return null;
    return (
      <div className="border-b border-gray-200 bg-gradient-to-r from-teal-50/50 via-white to-cyan-50/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-500 md:text-xs">
                پیشنهاد ویژه
              </span>
              <h2 className="text-lg font-bold text-gray-900 md:text-2xl">
                {user.name}، اینا مخصوص توئه
              </h2>
            </div>
          </div>
          <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:gap-6">
            {recs.map((subject) => (
              <div key={subject.id} className="w-[220px] shrink-0 md:w-[260px]">
                <SubjectCard subject={subject} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return <MobileFeed />;
  }

  return (
    <div
      className={`${darkMode ? 'dark' : ''} bg-gray-50 text-gray-700 antialiased`}
      dir="rtl"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-xl focus:bg-teal-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        رفتن به محتوای اصلی
      </a>
      <style jsx global>{`
        .dark {
          --bg: #1a1a2e;
          --bg-card: #16213e;
          --bg-section: #0f3460;
          --text: #e0e0e0;
          --text-muted: #a0a0a0;
          --border: rgba(255, 255, 255, 0.1);
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(20, 184, 166, 0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out forwards;
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .rtl-enter {
          animation: fade-in-right 0.5s ease-out forwards;
        }
      `}</style>
      <Meta
        title="ویکی‌نظر - قبل از هر انتخابی، تجربه دیگران را ببین"
        description="ویکی‌نظر پلتفرم اشتراک‌گذاری تجربیات درباره محصولات، خدمات، مکان‌ها و هر چیز دیگر. قبل از هر انتخابی، تجربه دیگران را ببینید و تجربه خود را به اشتراک بگذارید."
      />
      <main id="main-content">
        <Banner />
        {heroSection}
        <div className="border-b border-gray-200" />
        <StatsBar />
        <div className="border-b border-gray-200" />
        <CategoryGrid />
        <TrendingSection />
        <AllSubjects />
        <ExperiencesSection />
        <RecommendedSection />
        <RequestSection />
        <CTASection />
      </main>
      <div className="border-b border-gray-200" />
      <Footer />
      {lightboxImg && (
        <Lightbox src={lightboxImg} onClose={() => setLightboxImg('')} />
      )}
      <LoginModalComponent />

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-300 bg-white/80 backdrop-blur-lg md:hidden"
        role="navigation"
        aria-label="منوی اصلی موبایل"
      >
        <div className="flex items-center justify-around py-2">
          {[
            { icon: '🏠', label: 'خانه', href: '/' },
            {
              icon: '🔍',
              label: 'جستجو',
              href: '#',
              action: () => {
                searchInputRef.current?.focus();
              },
            },
            { icon: '📝', label: 'ثبت تجربه', href: '/submit' },
            {
              icon: user ? '👤' : '🔐',
              label: user?.name ?? 'ورود',
              href: user?.role === 'expert' ? '/dashboard' : '#',
              action: user ? undefined : () => setShowLogin(true),
            },
          ].map((item) =>
            item.href && item.href !== '#' ? (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[9px] font-medium text-gray-600">
                  {item.label}
                </span>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center gap-0.5 px-3 py-1"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[9px] font-medium text-gray-600">
                  {item.label}
                </span>
              </button>
            ),
          )}
        </div>
      </nav>
    </div>
  );
};

export { Base };
