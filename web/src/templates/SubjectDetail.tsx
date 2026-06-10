import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Meta } from '../layout/Meta';
import { api } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { Lightbox } from '../utils/Lightbox';
import { StarRating } from '../utils/StarRating';
import { useToast } from '../utils/ToastContext';
import { useMobile } from '../utils/useMobile';

interface SubjectData {
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
  images: string[];
}

interface ExperienceData {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

type DetailProps = {
  subject: SubjectData;
  imgs: string[];
  selectedImg: number;
  setSelectedImg: (n: number) => void;
  subjectExperiences: ExperienceData[];
  related: SubjectData[];
  newRating: number;
  setNewRating: (n: number) => void;
  newComment: string;
  setNewComment: (s: string) => void;
  photoPreview: string | null;
  setPhotoPreview: (s: string | null) => void;
  setLightboxImg: (s: string) => void;
  lightboxImg: string;
  onSubmitExperience: () => Promise<void>;
  onLikeExperience: (id: string) => Promise<void>;
  toast: ReturnType<typeof useToast>['toast'];
  user: ReturnType<typeof useAuth>['user'];
};

const shareSubject = (name: string) => {
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

/* eslint-disable @typescript-eslint/no-use-before-define */
const SubjectDetail = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { id } = router.query;
  const isMobile = useMobile();

  const subjectId = Array.isArray(id) ? id[0] : id;

  const [subject, setSubject] = useState<SubjectData | null>(null);
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [related, setRelated] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectData, expData, statsData] = await Promise.all([
          api.getSubjectById(subjectId),
          api.getExperiences({ subjectId }),
          api.getSubjectStats(subjectId),
        ]);
        const mapped: SubjectData = {
          id: subjectData.id,
          name: subjectData.title,
          nameEn: subjectData.slug,
          type: subjectData.category || '',
          rating: statsData.averageRating,
          reviews: statsData.totalExperiences,
          image: subjectData.icon || '',
          description: subjectData.description || '',
          tags: [],
          createdAt: subjectData.createdAt,
          images: subjectData.icon ? [subjectData.icon] : [],
        };
        setSubject(mapped);
        setExperiences(
          expData.experiences.map(
            (e): ExperienceData => ({
              id: e.id,
              user: e.author?.displayName || e.authorId,
              avatar: e.author?.avatarUrl || '',
              rating: e.rating,
              comment: e.content,
              date: e.createdAt,
              likes: e.likes,
            }),
          ),
        );
        if (subjectData.category) {
          const relatedData = await api.getSubjects({
            category: subjectData.category,
            limit: 5,
          });
          setRelated(
            relatedData.subjects
              .filter((s) => s.id !== subjectData.id)
              .slice(0, 4)
              .map(
                (s): SubjectData => ({
                  id: s.id,
                  name: s.title,
                  nameEn: s.slug,
                  type: s.category || '',
                  rating: 0,
                  reviews: s.experienceCount,
                  image: s.icon || '',
                  description: s.description || '',
                  tags: [],
                  createdAt: s.createdAt,
                  images: s.icon ? [s.icon] : [],
                }),
              ),
          );
        }
      } catch {
        setSubject(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectId]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !subjectId) {
      toast('لطفاً تجربه خود را بنویسید', 'error');
      return;
    }
    try {
      await api.createExperience({
        content: newComment,
        rating: newRating,
        subjectId,
      });
      toast('تجربه شما ثبت شد!', 'success');
      setNewComment('');
      setNewRating(0);
      setPhotoPreview(null);
      const expData = await api.getExperiences({ subjectId });
      setExperiences(
        expData.experiences.map(
          (e): ExperienceData => ({
            id: e.id,
            user: e.author?.displayName || e.authorId,
            avatar: e.author?.avatarUrl || '',
            rating: e.rating,
            comment: e.content,
            date: e.createdAt,
            likes: e.likes,
          }),
        ),
      );
      const statsData = await api.getSubjectStats(subjectId);
      setSubject((prev) =>
        prev
          ? {
              ...prev,
              rating: statsData.averageRating,
              reviews: statsData.totalExperiences,
            }
          : prev,
      );
    } catch {
      toast('خطا در ثبت تجربه', 'error');
    }
  };

  const handleLike = async (expId: string) => {
    if (!user) {
      toast('برای پسندیدن ابتدا وارد حساب خود شوید', 'error');
      return;
    }
    try {
      const result = await api.likeExperience(expId);
      setExperiences((prev) =>
        prev.map((e) => (e.id === expId ? { ...e, likes: result.likes } : e)),
      );
    } catch {
      toast('خطا در ثبت پسندیدن', 'error');
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-100"
        dir="rtl"
      >
        <div className="text-lg text-gray-600">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 p-8 text-center"
        dir="rtl"
      >
        <span className="text-5xl">😕</span>
        <h1 className="text-xl font-bold text-gray-800">
          صفحه مورد نظر یافت نشد
        </h1>
        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  const imgs = subject.images.length > 0 ? subject.images : [subject.image];

  if (isMobile) {
    return (
      <MobileSubjectDetail
        subject={subject}
        imgs={imgs}
        selectedImg={selectedImg}
        setSelectedImg={setSelectedImg}
        subjectExperiences={experiences}
        related={related}
        newRating={newRating}
        setNewRating={setNewRating}
        newComment={newComment}
        setNewComment={setNewComment}
        photoPreview={photoPreview}
        setPhotoPreview={setPhotoPreview}
        setLightboxImg={setLightboxImg}
        lightboxImg={lightboxImg}
        onSubmitExperience={handleSubmit}
        onLikeExperience={handleLike}
        toast={toast}
        user={user}
      />
    );
  }

  return (
    <DesktopSubjectDetail
      subject={subject}
      imgs={imgs}
      selectedImg={selectedImg}
      setSelectedImg={setSelectedImg}
      subjectExperiences={experiences}
      related={related}
      newRating={newRating}
      setNewRating={setNewRating}
      newComment={newComment}
      setNewComment={setNewComment}
      photoPreview={photoPreview}
      setPhotoPreview={setPhotoPreview}
      setLightboxImg={setLightboxImg}
      lightboxImg={lightboxImg}
      onSubmitExperience={handleSubmit}
      onLikeExperience={handleLike}
      toast={toast}
      user={user}
    />
  );
};

const MobileSubjectDetail = ({
  subject,
  imgs,
  selectedImg,
  setSelectedImg,
  subjectExperiences,
  related,
  newRating,
  setNewRating,
  newComment,
  setNewComment,
  photoPreview,
  setPhotoPreview,
  setLightboxImg,
  lightboxImg,
  onSubmitExperience,
  onLikeExperience,
  toast,
  user,
}: DetailProps) => (
  <div className="min-h-screen bg-gray-100 text-gray-800" dir="rtl">
    <Meta
      title={`${subject.name} - ویکی‌نظر`}
      description={subject.description}
    />

    {/* Header */}
    <div className="sticky top-0 z-30 border-b border-gray-300 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-gray-900"
        >
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
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => shareSubject(subject.name)}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600"
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
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          >
            بازگشت
          </Link>
        </div>
      </div>
    </div>

    {/* Hero Image */}
    <div className="relative">
      <button
        onClick={() => setLightboxImg(imgs[selectedImg] ?? subject.image)}
        className="w-full"
      >
        <img
          src={imgs[selectedImg] ?? subject.image}
          alt={subject.name}
          className="h-52 w-full object-cover"
          loading="lazy"
        />
      </button>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {imgs.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {imgs.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedImg(i)}
              aria-label={`عکس ${i + 1}`}
              className={`size-2 rounded-full transition-all ${i === selectedImg ? 'w-6 bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
      <div className="absolute bottom-3 right-3 flex gap-1.5">
        <span className="rounded-lg bg-teal-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          📊 {subject.reviews} تجربه
        </span>
      </div>
    </div>

    {/* Subject Info */}
    <div className="border-b border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
          {subject.type}
        </span>
        <span className="text-[10px] text-gray-500">{subject.createdAt}</span>
      </div>
      <h1 className="text-lg font-bold text-gray-900">{subject.name}</h1>
      <p className="text-xs text-gray-600">{subject.nameEn}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">
        {subject.description}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {subject.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-teal-100 bg-teal-50 px-2.5 py-1">
          <span className="text-sm text-amber-500">★</span>
          <span className="text-sm font-bold text-teal-700">
            {subject.rating}
          </span>
          <span className="text-[10px] text-teal-600">
            ({subject.reviews} نظر)
          </span>
        </div>
        <button
          onClick={() => shareSubject(subject.name)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[10px] font-bold text-gray-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
        >
          🔗 اشتراک
        </button>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-sm">💬</div>
          <div className="text-[9px] font-bold text-gray-700">
            {subject.reviews}
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-sm">📂</div>
          <div className="text-[9px] font-bold text-gray-700">
            {subject.type}
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-sm">📅</div>
          <div className="text-[9px] font-bold text-gray-700">
            {subject.createdAt?.slice(0, 4) ?? '--'}
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-sm">👁️</div>
          <div className="text-[9px] font-bold text-gray-700">--</div>
        </div>
      </div>
    </div>

    {/* New Experience Form */}
    <div className="mx-3 mt-3 rounded-xl border border-dashed border-teal-300 bg-teal-50/30 p-4">
      <h3 className="mb-3 text-sm font-bold text-gray-800">ثبت تجربه جدید</h3>
      {user ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">امتیاز:</span>
            <StarRating value={newRating} onChange={setNewRating} />
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="تجربه‌ات را بنویس..."
            rows={2}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs text-gray-700 placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[10px] font-semibold text-gray-700 transition-all hover:border-teal-300 hover:bg-teal-50">
              📷 عکس
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                    toast('عکس اضافه شد', 'success');
                  }
                }}
              />
            </label>
            {photoPreview && (
              <span className="text-[10px] font-semibold text-green-700">
                ✅ انتخاب شد
              </span>
            )}
            <button
              onClick={onSubmitExperience}
              disabled={!newComment.trim()}
              className="mr-auto rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
            >
              ارسال
            </button>
          </div>
        </div>
      ) : (
        <div className="py-3 text-center">
          <p className="mb-2 text-sm text-gray-600">برای ثبت تجربه باید وارد حساب خود شوید</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-600"
          >
            ورود به حساب
          </Link>
        </div>
      )}
    </div>

    {/* Experiences */}
    <div className="px-3 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">تجربیات کاربران</h2>
        <span className="rounded-lg bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
          {subjectExperiences.length} مورد
        </span>
      </div>
      <div className="space-y-2">
        {subjectExperiences.map((exp) => (
          <div
            key={exp.id}
            className="rounded-xl border border-gray-300 bg-white p-3 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <img
                  src={exp.avatar}
                  alt={exp.user}
                  className="size-8 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-gray-800">
                      {exp.user}
                    </h4>
                  </div>
                  <p className="text-[9px] text-gray-500">{exp.date}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 rounded-md bg-teal-50 px-1.5 py-0.5">
                <span className="text-[9px] text-amber-500">★</span>
                <span className="text-[10px] font-bold text-teal-700">
                  {exp.rating}
                </span>
              </div>
            </div>
            <p className="mb-2 text-xs leading-relaxed text-gray-700">
              &ldquo;{exp.comment}&rdquo;
            </p>
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <div className="flex items-center gap-3 text-[10px] text-gray-600">
                <button
                  onClick={() => onLikeExperience(exp.id)}
                  className="flex items-center gap-0.5 transition-colors hover:text-red-500"
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
                  onClick={() => shareSubject(subject.name)}
                  className="transition-colors hover:text-teal-600"
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
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Related */}
    {related.length > 0 && (
      <div className="px-3 py-6">
        <h2 className="mb-3 text-base font-bold text-gray-900">
          موضوعات مشابه
        </h2>
        <div className="scrollbar-hide -mx-3 flex gap-3 overflow-x-auto px-3">
          {related.map((s) => (
            <Link
              key={s.id}
              href={`/subject/${s.id}`}
              className="w-[160px] shrink-0"
            >
              <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-all hover:shadow-md">
                <img
                  src={s.image}
                  alt={s.name}
                  className="h-20 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-2">
                  <h3 className="text-[11px] font-bold text-gray-800">
                    {s.name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1">
                    <span className="text-[9px] text-amber-500">★</span>
                    <span className="text-[9px] font-bold text-teal-700">
                      {s.rating}
                    </span>
                    <span className="text-[8px] text-gray-500">
                      ({s.reviews})
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )}

    {lightboxImg && (
      <Lightbox src={lightboxImg} onClose={() => setLightboxImg('')} />
    )}
  </div>
);

const DesktopSubjectDetail = ({
  subject,
  imgs,
  selectedImg,
  setSelectedImg,
  subjectExperiences,
  related,
  newRating,
  setNewRating,
  newComment,
  setNewComment,
  photoPreview,
  setPhotoPreview,
  setLightboxImg,
  lightboxImg,
  onSubmitExperience,
  onLikeExperience,
  toast,
  user,
}: DetailProps) => (
  <div className="min-h-screen bg-gray-100 text-gray-700 antialiased" dir="rtl">
    <Meta
      title={`${subject.name} - ویکی‌نظر`}
      description={subject.description}
    />
    <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold text-gray-800"
        >
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
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => shareSubject(subject.name)}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-500"
            aria-label="اشتراک‌گذاری"
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
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
          >
            ← بازگشت
          </Link>
        </div>
      </div>
    </div>
    <div className="relative">
      <button
        onClick={() => setLightboxImg(imgs[selectedImg] ?? subject.image)}
        className="w-full"
      >
        <img
          src={imgs[selectedImg] ?? subject.image}
          alt={subject.name}
          className="h-56 w-full object-cover md:h-96"
          loading="lazy"
        />
      </button>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {imgs.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {imgs.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedImg(i)}
              aria-label={`عکس ${i + 1}`}
              className={`size-2 rounded-full transition-all ${i === selectedImg ? 'w-6 bg-white' : 'bg-white/50 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <span className="rounded-lg bg-teal-500/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm md:text-xs">
          📊 {subject.reviews} تجربه
        </span>
        <button
          onClick={() => shareSubject(subject.name)}
          className="rounded-lg bg-teal-500/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-teal-500 md:text-xs"
        >
          🔗 اشتراک
        </button>
      </div>
    </div>
    <div className="relative mx-auto -mt-8 max-w-6xl px-4 sm:px-6">
      <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-lg md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-lg bg-teal-50 px-2.5 py-0.5 text-[10px] font-medium text-teal-700 md:text-xs">
                {subject.type}
              </span>
              <span className="text-[10px] text-gray-500">
                {subject.createdAt}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 md:text-3xl">
              {subject.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 md:text-base">
              {subject.nameEn}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 md:text-base">
              {subject.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {subject.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600 md:text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-row flex-wrap items-center gap-3 md:flex-col md:items-end">
            <div className="flex items-center gap-1.5 rounded-xl border border-teal-100 bg-teal-50 px-3 py-1.5 md:px-4 md:py-2">
              <span className="text-sm text-teal-500 md:text-lg">★</span>
              <span className="text-base font-bold text-teal-700 md:text-xl">
                {subject.rating}
              </span>
              <span className="text-[10px] text-teal-500 md:text-xs">
                ({subject.reviews} نظر)
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-200 pt-6 md:grid-cols-4">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <div className="text-base md:text-lg">💬</div>
            <div className="mt-1 text-[10px] font-semibold text-gray-700 md:text-xs">
              تجربیات
            </div>
            <div className="text-[9px] text-gray-600 md:text-[11px]">
              {subject.reviews} مورد
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <div className="text-base md:text-lg">📂</div>
            <div className="mt-1 text-[10px] font-semibold text-gray-700 md:text-xs">
              دسته‌بندی
            </div>
            <div className="text-[9px] text-gray-600 md:text-[11px]">
              {subject.type}
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <div className="text-base md:text-lg">📅</div>
            <div className="mt-1 text-[10px] font-semibold text-gray-700 md:text-xs">
              تاریخ ثبت
            </div>
            <div className="text-[9px] text-gray-600 md:text-[11px]">
              {subject.createdAt}
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <div className="text-base md:text-lg">👁️</div>
            <div className="mt-1 text-[10px] font-semibold text-gray-700 md:text-xs">
              بازدید
            </div>
            <div className="text-[9px] text-gray-600 md:text-[11px]">--</div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => {
              document
                .getElementById('new-experience-desktop')
                ?.scrollIntoView({ behavior: 'smooth' });
              toast('فرم ثبت تجربه آماده است', 'info');
            }}
            className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-teal-600 hover:to-cyan-600"
          >
            ✍️ ثبت تجربه جدید
          </button>
          <button
            onClick={() => shareSubject(subject.name)}
            className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
          >
            🔗 اشتراک‌گذاری
          </button>
        </div>
      </div>
    </div>
    <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 md:text-2xl">
            تجربیات کاربران
          </h2>
          <p className="text-xs text-gray-600 md:text-sm">
            {subjectExperiences.length} تجربه برای {subject.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-teal-100 bg-teal-50 px-3 py-1.5">
          <span className="text-sm text-teal-500">★</span>
          <span className="text-sm font-bold text-teal-700">
            {subject.rating}
          </span>
        </div>
      </div>
      <div
        id="new-experience-desktop"
        className="mb-6 rounded-2xl border border-dashed border-teal-200 bg-teal-50/30 p-5"
      >
        <h3 className="mb-3 text-sm font-bold text-gray-800">
          تجربه خودت را ثبت کن
        </h3>
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">امتیاز تو:</span>
              <StarRating value={newRating} onChange={setNewRating} />
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="تجربه‌ات را بنویس..."
              rows={3}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-600 transition-all hover:border-teal-200 hover:bg-teal-50">
                📷 عکس
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                      toast('عکس اضافه شد', 'success');
                    }
                  }}
                />
              </label>
              {photoPreview && (
                <span className="text-[10px] text-green-600">
                  ✅ عکس انتخاب شد
                </span>
              )}
              <button
                onClick={onSubmitExperience}
                disabled={!newComment.trim()}
                className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
              >
                ارسال تجربه
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="mb-2 text-sm text-gray-600">برای ثبت تجربه باید وارد حساب خود شوید</p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-600"
            >
              ورود به حساب
            </Link>
          </div>
        )}
      </div>
      <div className="space-y-4">
        {subjectExperiences.map((exp) => (
          <div
            key={exp.id}
            className="rounded-2xl border border-gray-300 bg-white p-4 shadow-sm transition-all hover:shadow-md md:p-6"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={exp.avatar}
                  alt={exp.user}
                  className="size-10 rounded-full object-cover md:size-12"
                  loading="lazy"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-gray-800 md:text-base">
                      {exp.user}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-500">{exp.date}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-lg bg-teal-50 px-2 py-1">
                <span className="text-[10px] text-teal-500">★</span>
                <span className="text-xs font-bold text-teal-700">
                  {exp.rating}
                </span>
              </div>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700">
              &ldquo;{exp.comment}&rdquo;
            </p>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <button
                  onClick={() => onLikeExperience(exp.id)}
                  className="group flex items-center gap-1 transition-colors hover:text-red-500"
                  aria-label="پسندیدن"
                >
                  <svg
                    className="size-3.5 transition-transform group-hover:scale-110"
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
                  <span>{exp.likes}</span>
                </button>
                <button
                  onClick={() => shareSubject(subject.name)}
                  className="transition-colors hover:text-blue-500"
                  aria-label="اشتراک‌گذاری"
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
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    {related.length > 0 && (
      <div className="mx-auto mt-12 max-w-6xl px-4 pb-12 sm:px-6">
        <div className="mb-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-500 md:text-xs">
            مشابه
          </span>
          <h2 className="mt-1 text-lg font-bold text-gray-900 md:text-2xl">
            موضوعات مشابه
          </h2>
        </div>
        <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
          {related.map((s) => (
            <Link
              key={s.id}
              href={`/subject/${s.id}`}
              className="w-[200px] shrink-0 md:w-[240px]"
            >
              <div className="group overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-28 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-32"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <span className="rounded-md border border-white/20 bg-black/50 px-1.5 py-0.5 text-[9px] text-white backdrop-blur-sm">
                      {s.type}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold text-gray-800 transition-colors group-hover:text-teal-600">
                    {s.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[9px] text-teal-500">★</span>
                    <span className="text-[10px] font-bold text-teal-700">
                      {s.rating}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      ({s.reviews})
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )}
    {lightboxImg && (
      <Lightbox src={lightboxImg} onClose={() => setLightboxImg('')} />
    )}
  </div>
);

export { SubjectDetail };
