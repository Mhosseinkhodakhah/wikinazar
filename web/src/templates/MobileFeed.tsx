import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useAuth } from '../utils/AuthContext';

const categories = [
  { id: 'all', name: 'همه', icon: '🌟' },
  { id: 'tech', name: 'فناوری', icon: '💻' },
  { id: 'travel', name: 'سفر', icon: '✈️' },
  { id: 'food', name: 'غذا', icon: '🍽️' },
  { id: 'education', name: 'آموزش', icon: '📚' },
  { id: 'health', name: 'سلامت', icon: '💪' },
  { id: 'sports', name: 'ورزش', icon: '🏋️' },
  { id: 'beauty', name: 'زیبایی', icon: '💄' },
  { id: 'music', name: 'موسیقی', icon: '🎵' },
  { id: 'gaming', name: 'بازی', icon: '🎮' },
  { id: 'shopping', name: 'فروشگاه', icon: '🛍️' },
  { id: 'services', name: 'خدمات', icon: '🔧' },
];

const subjects = [
  {
    id: 1,
    name: 'آیفون ۱۵ پرو',
    nameEn: 'iPhone 15 Pro',
    type: 'tech',
    rating: 4.5,
    reviews: 12,
    image: 'https://images.unsplash.com/photo-1696446702183-cbd13c4781b4?w=400',
    description: 'تجربه استفاده از گوشی آیفون ۱۵ پرو',
    tags: ['موبایل', 'اپل', 'لوکس'],
  },
  {
    id: 2,
    name: 'کافه نادری',
    nameEn: 'Cafe Naderi',
    type: 'food',
    rating: 4.3,
    reviews: 8,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    description: 'تجربه حضور در کافه نادری تهران',
    tags: ['کافه', 'سنتی', 'دنج'],
  },
  {
    id: 5,
    name: 'هدفون سونی WH-1000XM5',
    nameEn: 'Sony WH-1000XM5',
    type: 'tech',
    rating: 4.8,
    reviews: 9,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    description: 'بررسی هدفون حذف نویز سونی',
    tags: ['هدفون', 'صوتی', 'سونی'],
  },
  {
    id: 12,
    name: 'فیلم جدایی نادر از سیمین',
    nameEn: 'A Separation',
    type: 'entertainment',
    rating: 4.9,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
    description: 'نقد و بررسی فیلم جدایی نادر از سیمین',
    tags: ['سینما', 'ایرانی', 'اسکار'],
  },
  {
    id: 17,
    name: 'کنسول پلی‌استیشن ۵',
    nameEn: 'PlayStation 5',
    type: 'gaming',
    rating: 4.8,
    reviews: 11,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
    description: 'تجربه بازی با کنسول پلی‌استیشن ۵',
    tags: ['گیمینگ', 'کنسول', 'سرگرمی'],
  },
  {
    id: 13,
    name: 'اسنپ',
    nameEn: 'Snapp',
    type: 'services',
    rating: 3.8,
    reviews: 25,
    image: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=400',
    description: 'تجربه استفاده از سرویس اسنپ',
    tags: ['تاکسی', 'اینترنتی', 'حمل و نقل'],
  },
  {
    id: 9,
    name: 'کتاب هنر شفاف اندیشیدن',
    nameEn: 'Art of Clear Thinking',
    type: 'education',
    rating: 4.4,
    reviews: 14,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    description: 'بررسی کتاب هنر شفاف اندیشیدن',
    tags: ['کتاب', 'توسعه فردی', 'روانشناسی'],
  },
  {
    id: 14,
    name: 'دیجی‌کالا',
    nameEn: 'Digikala',
    type: 'shopping',
    rating: 4.0,
    reviews: 22,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    description: 'تجربه خرید از دیجی‌کالا',
    tags: ['فروشگاه', 'آنلاین', 'اقتصادی'],
  },
  {
    id: 16,
    name: 'خودروی تارا',
    nameEn: 'IKCO Tara',
    type: 'automotive',
    rating: 3.7,
    reviews: 14,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
    description: 'تجربه مالکیت و رانندگی با خودروی تارا',
    tags: ['خودرو', 'ایرانی', 'اقتصادی'],
  },
  {
    id: 15,
    name: 'سالن زیبایی نگین',
    nameEn: 'Negin Beauty Salon',
    type: 'beauty',
    rating: 4.6,
    reviews: 8,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    description: 'تجربه خدمات سالن زیبایی نگین',
    tags: ['زیبایی', 'مو', 'پوست'],
  },
  {
    id: 18,
    name: 'اسپاتیفای',
    nameEn: 'Spotify',
    type: 'music',
    rating: 4.4,
    reviews: 19,
    image: 'https://images.unsplash.com/photo-1611339555312-f607c3b3a6f6?w=400',
    description: 'تجربه استفاده از سرویس موسیقی اسپاتیفای',
    tags: ['موسیقی', 'استریم', 'اشتراک'],
  },
];

const experiences = [
  {
    id: 1,
    subjectId: 1,
    user: 'مریم کرمی',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    rating: 5,
    comment:
      'واقعاً عالیه! دوربینش فوق‌العاده و باتری‌ش عالی شده نسبت به نسخه قبلی.',
    date: '۲ ساعت پیش',
    likes: 34,
  },
  {
    id: 2,
    subjectId: 1,
    user: 'احمد رضایی',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    rating: 4,
    comment: 'گوشی خوبی هست ولی قیمتش زیاد شده. از نظر کارایی عالیه.',
    date: '۵ ساعت پیش',
    likes: 21,
  },
  {
    id: 3,
    subjectId: 2,
    user: 'سارا محمدی',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    rating: 4,
    comment: 'کافه‌ای دنج با فضای قدیمی و دلنشین. قهوه‌ش عالی بود.',
    date: 'دیروز',
    likes: 18,
  },
  {
    id: 4,
    subjectId: 5,
    user: 'علی ناصری',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    rating: 5,
    comment: 'بهترین هدفون حذف نویز بازار! موقع کار توی محیط شلوغ عالیه.',
    date: '۳ روز پیش',
    likes: 42,
  },
  {
    id: 5,
    subjectId: 12,
    user: 'نرگس کریمی',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    rating: 5,
    comment: 'یکی از بهترین فیلم‌های تاریخ سینمای ایران. بازی‌ها فوق‌العاده.',
    date: '۱ هفته پیش',
    likes: 67,
  },
  {
    id: 6,
    subjectId: 17,
    user: 'کیان رحیمی',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    rating: 5,
    comment: 'فوق‌العاده‌ست! گرافیک بی‌نظیر و لودینگ سریع.',
    date: '۱ روز پیش',
    likes: 45,
  },
  {
    id: 7,
    subjectId: 13,
    user: 'نرگس کریمی',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    rating: 3,
    comment: 'سرویس خوبیه ولی قیمت‌ها زیاد شده. گاهی راننده کنسل می‌کنه.',
    date: '۶ ساعت پیش',
    likes: 29,
  },
  {
    id: 8,
    subjectId: 16,
    user: 'امیر حسینی',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    rating: 3,
    comment: 'ماشین خوبیه برای قیمتش، اما مصرف سوختش بالاست.',
    date: '۲ روز پیش',
    likes: 17,
  },
  {
    id: 9,
    subjectId: 9,
    user: 'سارا محمدی',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    rating: 5,
    comment:
      'کتابی که دیدگاهتون رو نسبت به خیلی چیزها تغییر میده. حتماً بخونید.',
    date: '۴ روز پیش',
    likes: 38,
  },
  {
    id: 10,
    subjectId: 14,
    user: 'رضا کریمی',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    rating: 4,
    comment:
      'تجربه خرید خوبی بود. تنوع محصولات عالیه و ارسال به موقع انجام شد.',
    date: '۳ روز پیش',
    likes: 22,
  },
  {
    id: 11,
    subjectId: 15,
    user: 'الناز صادقی',
    avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
    rating: 5,
    comment: 'بهترین سالن زیبایی که رفتم! کادر حرفه‌ای و محیط تمیز.',
    date: '۶ ساعت پیش',
    likes: 31,
  },
  {
    id: 12,
    subjectId: 18,
    user: 'نرگس جعفری',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    rating: 4,
    comment: 'برای کشف موسیقی جدید عالیه. پلی‌لیست‌هاش فوق‌العاده‌ان.',
    date: '۴ روز پیش',
    likes: 23,
  },
];

const MobileFeed = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

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
  }, [activeCategory, search]);

  const getExperiencesForSubject = (subjectId: number) =>
    experiences.filter((e) => e.subjectId === subjectId);

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  const toggleLike = (id: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
              <Link
                href="/?login=1"
                className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-600"
              >
                ورود
              </Link>
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
                setSearch('');
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
                                className={`flex items-center gap-1 text-[10px] font-medium transition-all ${
                                  likedPosts.has(exp.id)
                                    ? 'text-red-500'
                                    : 'text-gray-500 hover:text-red-500'
                                }`}
                              >
                                <svg
                                  className="size-3.5"
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
          })
        )}
      </div>
    </div>
  );
};

export { MobileFeed };
