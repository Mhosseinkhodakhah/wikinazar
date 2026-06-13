import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Meta } from '../layout/Meta';
import {
  api,
  type DashboardDTO,
  type ExperienceDTO,
  type RequestDTO,
} from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { ClickableImage } from '../utils/ClickableImage';
import { useToast } from '../utils/ToastContext';
import { useMobile } from '../utils/useMobile';

function getStatusLabel(status: string): string {
  if (status === 'open') return 'در انتظار';
  if (status === 'fulfilled') return 'پاسخ داده شده';
  return 'بسته شده';
}

function getStatusClass(status: string): string {
  return status === 'open'
    ? 'bg-amber-50 text-amber-700'
    : 'bg-emerald-50 text-emerald-700';
}

function formatDate(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  if (minutes < 1) return 'همین الان';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  if (hours < 24) return `${hours} ساعت پیش`;
  if (days < 7) return `${days} روز پیش`;
  if (weeks < 4) return `${weeks} هفته پیش`;
  return new Date(dateStr).toLocaleDateString('fa-IR');
}

type DisplayExperience = {
  id: string;
  subjectName: string;
  subjectId: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  images: string[];
};

type DisplayRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  votes: number;
};

function mapExperience(exp: ExperienceDTO): DisplayExperience {
  return {
    id: exp.id,
    subjectName: exp.subject?.title ?? '—',
    subjectId: exp.subjectId,
    rating: exp.rating,
    comment: exp.content,
    date: formatDate(exp.createdAt),
    likes: exp.likes,
    images: exp.images ?? [],
  };
}

function mapRequest(req: RequestDTO): DisplayRequest {
  return {
    id: req.id,
    title: req.title,
    description: req.description ?? '',
    status: req.status,
    date: formatDate(req.createdAt),
    votes: req.votes,
  };
}

type ViewProps = {
  user: ReturnType<typeof useAuth>['user'];
  logout: ReturnType<typeof useAuth>['logout'];
  activeTab: 'experiences' | 'requests';
  setActiveTab: (tab: 'experiences' | 'requests') => void;
  experiences: DisplayExperience[];
  requests: DisplayRequest[];
  stats: DashboardDTO['stats'] | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  editing: { id: string; content: string; rating: number } | null;
  onEditChange: (field: 'content' | 'rating', value: string | number) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  editingProfile: boolean;
  profileDisplayName: string;
  profileBio: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  avatarPreview: string;
  onToggleProfileEdit: () => void;
  onProfileFieldChange: (field: string, value: string) => void;
  onPasswordFieldChange: (field: string, value: string) => void;
  onSaveProfile: () => void;
  onChangePassword: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancelProfileEdit: () => void;
};

const DesktopDashboardView = ({
  user,
  logout,
  activeTab,
  setActiveTab,
  experiences,
  requests,
  stats,
  onEdit,
  onDelete,
  editing,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  editingProfile,
  profileDisplayName,
  profileBio,
  currentPassword,
  newPassword,
  confirmPassword,
  avatarPreview,
  onToggleProfileEdit,
  onProfileFieldChange,
  onPasswordFieldChange,
  onSaveProfile,
  onChangePassword,
  onAvatarChange,
  onCancelProfileEdit,
}: ViewProps) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="min-h-screen bg-gray-100 text-gray-800 antialiased"
      dir="rtl"
    >
      <Meta title="داشبورد - ویکی‌نظر" description="پنل کاربری ویکی‌نظر" />
      <div className="border-b border-gray-300 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-gray-900"
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
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
            >
              صفحه اصلی
            </Link>
            <button
              onClick={onToggleProfileEdit}
              className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100"
            >
              ویرایش پروفایل
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-all hover:bg-red-100"
            >
              خروج
            </button>
          </div>
        </div>
      </div>
      <div className="border-b border-gray-300 bg-gradient-to-b from-white to-gray-50 py-8 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <div className="relative">
              <img
                src={avatarPreview || user?.avatar || ''}
                alt={user?.name}
                className="size-20 rounded-2xl border-2 border-teal-300 object-cover shadow-md md:size-24"
              />
              {editingProfile && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-teal-500 p-1.5 text-white shadow-md transition-colors hover:bg-teal-600"
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </div>
            <div className="text-center md:text-right">
              {editingProfile ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={profileDisplayName}
                    onChange={(e) =>
                      onProfileFieldChange('displayName', e.target.value)
                    }
                    placeholder="نام نمایشی"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                  <textarea
                    value={profileBio}
                    onChange={(e) =>
                      onProfileFieldChange('bio', e.target.value)
                    }
                    placeholder="بیوگرافی"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                  />
                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="mb-2 text-xs font-bold text-gray-700">
                      تغییر رمز عبور
                    </h4>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) =>
                        onPasswordFieldChange('currentPassword', e.target.value)
                      }
                      placeholder="رمز عبور فعلی"
                      className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) =>
                        onPasswordFieldChange('newPassword', e.target.value)
                      }
                      placeholder="رمز عبور جدید"
                      className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        onPasswordFieldChange('confirmPassword', e.target.value)
                      }
                      placeholder="تکرار رمز عبور جدید"
                      className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                    />
                    <button
                      onClick={onChangePassword}
                      className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
                    >
                      تغییر رمز عبور
                    </button>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={onSaveProfile}
                      className="rounded-lg bg-teal-500 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-600"
                    >
                      ذخیره پروفایل
                    </button>
                    <button
                      onClick={onCancelProfileEdit}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      لغو
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
                    {user?.name}
                  </h1>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  {user?.bio && (
                    <p className="mt-1 text-xs text-gray-500">{user.bio}</p>
                  )}
                  <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
                    <span className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      ⭐ {stats?.averageRating?.toFixed(1) ?? 0} امتیاز
                    </span>
                    <span className="rounded-lg bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                      📝 {stats?.totalExperiences ?? 0} تجربه
                    </span>
                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      📋 {stats?.totalRequests ?? 0} درخواست
                    </span>
                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {user?.role === 'expert' ? '🔬 کارشناس' : '👤 کاربر عادی'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-b border-gray-300 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl gap-4 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setActiveTab('experiences')}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition-all ${activeTab === 'experiences' ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
          >
            📝 تجربیات من
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition-all ${activeTab === 'requests' ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
          >
            📋 درخواست‌های من
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'experiences' ? (
          <div className="grid gap-4 md:grid-cols-2">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    {exp.subjectName}
                  </h3>
                </div>
                <p className="mt-1 text-[10px] text-gray-500">{exp.date}</p>
                {editing?.id === exp.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editing.content}
                      onChange={(e) => onEditChange('content', e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2 text-xs"
                      rows={3}
                    />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => onEditChange('rating', i + 1)}
                          className={`text-lg ${i < editing.rating ? 'text-amber-500' : 'text-gray-200'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={onSaveEdit}
                        className="rounded-lg bg-teal-500 px-3 py-1 text-[10px] font-semibold text-white"
                      >
                        ذخیره
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-[10px] font-semibold text-gray-700"
                      >
                        لغو
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${i < exp.rating ? 'text-amber-500' : 'text-gray-200'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-700">
                      {exp.comment}
                    </p>
                    {exp.images.length > 0 && (
                      <div className="mt-2">
                        <ClickableImage
                          src={exp.images[0]}
                          alt="تصویر تجربه"
                          className="h-24 w-full rounded-lg object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        ❤️ {exp.likes}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(exp.id)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-[10px] font-semibold text-gray-700 transition-all hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => onDelete(exp.id)}
                          className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-[10px] font-semibold text-red-700 transition-all hover:bg-red-100"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">
                        {req.title}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-700">
                      {req.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${getStatusClass(req.status)}`}
                      >
                        {getStatusLabel(req.status)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {req.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700">
                    👍 {req.votes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MobileDashboardView = ({
  user,
  logout,
  activeTab,
  setActiveTab,
  experiences,
  requests,
  stats,
  onEdit,
  onDelete,
  editing,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  editingProfile,
  profileDisplayName,
  profileBio,
  currentPassword,
  newPassword,
  confirmPassword,
  avatarPreview,
  onToggleProfileEdit,
  onProfileFieldChange,
  onPasswordFieldChange,
  onSaveProfile,
  onChangePassword,
  onAvatarChange,
  onCancelProfileEdit,
}: ViewProps) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const expContent =
    experiences.length > 0 ? (
      experiences.map((exp) => (
        <div
          key={exp.id}
          className="rounded-xl border border-gray-300 bg-white p-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-gray-900">
              {exp.subjectName}
            </h3>
          </div>
          <p className="mt-1 text-[10px] text-gray-500">{exp.date}</p>
          {editing?.id === exp.id ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editing.content}
                onChange={(e) => onEditChange('content', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-xs"
                rows={3}
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onEditChange('rating', i + 1)}
                    className={`text-lg ${i < editing.rating ? 'text-amber-500' : 'text-gray-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onSaveEdit}
                  className="rounded-lg bg-teal-500 px-3 py-1 text-[10px] font-semibold text-white"
                >
                  ذخیره
                </button>
                <button
                  onClick={onCancelEdit}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-[10px] font-semibold text-gray-700"
                >
                  لغو
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-1 flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${i < exp.rating ? 'text-amber-500' : 'text-gray-200'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-gray-700">
                {exp.comment}
              </p>
              {exp.images.length > 0 && (
                <div className="mt-2">
                  <ClickableImage
                    src={exp.images[0]}
                    alt="تصویر تجربه"
                    className="h-20 w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                <span className="text-xs font-semibold text-gray-600">
                  ❤️ {exp.likes}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(exp.id)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-[10px] font-semibold text-gray-700"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-[10px] font-semibold text-red-700"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))
    ) : (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-gray-700">
          هنوز تجربه‌ای ثبت نکردی
        </p>
        <Link
          href="/submit"
          className="mt-3 inline-flex rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2 text-sm font-bold text-white shadow-sm"
        >
          ثبت تجربه جدید
        </Link>
      </div>
    );

  const reqContent =
    requests.length > 0 ? (
      requests.map((req) => (
        <div
          key={req.id}
          className="rounded-xl border border-gray-300 bg-white p-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">{req.title}</h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-gray-700">
                {req.description}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${getStatusClass(req.status)}`}
                >
                  {getStatusLabel(req.status)}
                </span>
                <span className="text-[10px] text-gray-500">{req.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700">
              👍 {req.votes}
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-gray-700">
          هنوز درخواستی ثبت نکردی
        </p>
        <Link
          href="/request"
          className="mt-3 inline-flex rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2 text-sm font-bold text-white shadow-sm"
        >
          درخواست موضوع جدید
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800" dir="rtl">
      <div className="bg-gradient-to-b from-teal-500 to-teal-600 px-4 pb-6 pt-8 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={avatarPreview || user?.avatar || ''}
              alt={user?.name}
              className="size-20 rounded-full border-4 border-white/60 object-cover shadow-lg"
            />
            {editingProfile && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full bg-teal-500 p-1.5 text-white shadow-md transition-colors hover:bg-teal-600"
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>
          {editingProfile ? (
            <div className="w-full space-y-2 text-right">
              <input
                type="text"
                value={profileDisplayName}
                onChange={(e) =>
                  onProfileFieldChange('displayName', e.target.value)
                }
                placeholder="نام نمایشی"
                className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
              />
              <textarea
                value={profileBio}
                onChange={(e) => onProfileFieldChange('bio', e.target.value)}
                placeholder="بیوگرافی"
                rows={2}
                className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
              />
              <div className="border-t border-white/20 pt-3">
                <h4 className="mb-2 text-xs font-bold text-white/80">
                  تغییر رمز عبور
                </h4>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    onPasswordFieldChange('currentPassword', e.target.value)
                  }
                  placeholder="رمز عبور فعلی"
                  className="mb-2 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    onPasswordFieldChange('newPassword', e.target.value)
                  }
                  placeholder="رمز عبور جدید"
                  className="mb-2 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    onPasswordFieldChange('confirmPassword', e.target.value)
                  }
                  placeholder="تکرار رمز عبور جدید"
                  className="mb-2 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
                />
                <button
                  onClick={onChangePassword}
                  className="rounded-lg bg-amber-500/90 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-amber-500"
                >
                  تغییر رمز عبور
                </button>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={onSaveProfile}
                  className="flex-1 rounded-lg bg-white px-5 py-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50"
                >
                  ذخیره پروفایل
                </button>
                <button
                  onClick={onCancelProfileEdit}
                  className="flex-1 rounded-lg border border-white/30 bg-transparent px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                >
                  لغو
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-lg font-bold">{user?.name}</h1>
              <p className="text-sm text-teal-100">{user?.email}</p>
              {user?.bio && (
                <p className="mt-1 text-xs text-teal-100/80">{user.bio}</p>
              )}
            </div>
          )}
          {!editingProfile && (
            <div className="flex gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">
                ⭐ {stats?.averageRating?.toFixed(1) ?? 0} امتیاز
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">
                {user?.role === 'expert' ? '🔬 کارشناس' : '👤 کاربر'}
              </span>
            </div>
          )}
        </div>
        {!editingProfile && (
          <button
            onClick={onToggleProfileEdit}
            className="mx-auto mt-3 block rounded-full bg-white/20 px-4 py-1 text-[11px] font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            ✏️ ویرایش پروفایل
          </button>
        )}
      </div>
      {!editingProfile && (
        <>
          <div className="flex gap-2 px-4 py-3">
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
              <span className="text-lg font-bold text-gray-900">
                {stats?.totalExperiences ?? 0}
              </span>
              <span className="text-[10px] font-semibold text-gray-600">
                تجربه
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
              <span className="text-lg font-bold text-gray-900">
                {stats?.totalRequests ?? 0}
              </span>
              <span className="text-[10px] font-semibold text-gray-600">
                درخواست
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
              <span className="text-lg font-bold text-gray-900">
                {stats?.averageRating?.toFixed(1) ?? 0}
              </span>
              <span className="text-[10px] font-semibold text-gray-600">
                امتیاز
              </span>
            </div>
          </div>
          <div className="border-b border-gray-300 bg-white">
            <div className="flex gap-0">
              <button
                onClick={() => setActiveTab('experiences')}
                className={`flex-1 border-b-2 py-3 text-center text-xs font-bold transition-all ${activeTab === 'experiences' ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-500'}`}
              >
                📝 تجربیات من
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 border-b-2 py-3 text-center text-xs font-bold transition-all ${activeTab === 'requests' ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-500'}`}
              >
                📋 درخواست‌های من
              </button>
            </div>
          </div>
          <div className="space-y-3 p-3">
            {activeTab === 'experiences' ? expContent : reqContent}
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3 text-sm font-bold text-red-700 transition-all hover:bg-red-100"
            >
              خروج از حساب
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user, logout, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const isMobile = useMobile();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'experiences' | 'requests'>(
    'experiences',
  );
  const [experiences, setExperiences] = useState<DisplayExperience[]>([]);
  const [requests, setRequests] = useState<DisplayRequest[]>([]);
  const [stats, setStats] = useState<DashboardDTO['stats'] | null>(null);
  const [editing, setEditing] = useState<{
    id: string;
    content: string;
    rating: number;
  } | null>(null);

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await api.getDashboard(10);
      setExperiences(data.recentExperiences.map(mapExperience));
      setRequests(data.recentRequests.map(mapRequest));
      setStats(data.stats);
    } catch {
      toast?.('خطا در دریافت اطلاعات داشبورد', 'error');
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [fetchDashboard, user]);

  const handleEdit = useCallback(
    (id: string) => {
      const exp = experiences.find((e) => e.id === id);
      if (!exp) return;
      setEditing({ id: exp.id, content: exp.comment, rating: exp.rating });
    },
    [experiences],
  );

  const handleEditChange = useCallback(
    (field: 'content' | 'rating', value: string | number) => {
      setEditing((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editing) return;
    try {
      await api.updateExperience(editing.id, {
        content: editing.content,
        rating: editing.rating,
      });
      toast?.('تجربه ویرایش شد', 'success');
      setEditing(null);
      fetchDashboard();
    } catch {
      toast?.('خطا در ویرایش تجربه', 'error');
    }
  }, [editing, toast, fetchDashboard]);

  const handleCancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await api.deleteExperience(id);
        toast?.('تجربه حذف شد', 'success');
        fetchDashboard();
      } catch {
        toast?.('خطا در حذف تجربه', 'error');
      }
    },
    [toast, fetchDashboard],
  );

  const handleToggleProfileEdit = useCallback(() => {
    if (editingProfile) {
      setEditingProfile(false);
      setAvatarFile(null);
      setAvatarPreview('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setProfileDisplayName(user?.name || '');
      setProfileBio(user?.bio || '');
      setEditingProfile(true);
    }
  }, [editingProfile, user]);

  const handleProfileFieldChange = useCallback(
    (field: string, value: string) => {
      if (field === 'displayName') setProfileDisplayName(value);
      if (field === 'bio') setProfileBio(value);
    },
    [],
  );

  const handlePasswordFieldChange = useCallback(
    (field: string, value: string) => {
      if (field === 'currentPassword') setCurrentPassword(value);
      if (field === 'newPassword') setNewPassword(value);
      if (field === 'confirmPassword') setConfirmPassword(value);
    },
    [],
  );

  const handleSaveProfile = useCallback(async () => {
    try {
      await api.updateProfile({
        displayName: profileDisplayName || undefined,
        bio: profileBio || undefined,
      });
      if (avatarFile) {
        await api.uploadAvatar(avatarFile);
      }
      toast?.('پروفایل با موفقیت به‌روز شد', 'success');
      await refreshProfile();
      setEditingProfile(false);
      setAvatarFile(null);
      setAvatarPreview('');
      fetchDashboard();
    } catch {
      toast?.('خطا در ذخیره پروفایل', 'error');
    }
  }, [
    profileDisplayName,
    profileBio,
    avatarFile,
    toast,
    refreshProfile,
    fetchDashboard,
  ]);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword) {
      toast?.('لطفاً رمز عبور فعلی و جدید را وارد کنید', 'error');
      return;
    }
    if (newPassword.length < 8) {
      toast?.('رمز عبور جدید باید حداقل ۸ کاراکتر باشد', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast?.('رمز عبور جدید و تکرار آن مطابقت ندارند', 'error');
      return;
    }
    try {
      await api.changePassword({ currentPassword, newPassword });
      toast?.('رمز عبور با موفقیت تغییر کرد', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast?.(err.message || 'خطا در تغییر رمز عبور', 'error');
    }
  }, [currentPassword, newPassword, confirmPassword, toast]);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast?.('حجم تصویر باید کمتر از ۵ مگابایت باشد', 'error');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [toast],
  );

  const handleCancelProfileEdit = useCallback(() => {
    setEditingProfile(false);
    setAvatarFile(null);
    setAvatarPreview('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, []);

  if (authLoading || !user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-100"
        dir="rtl"
      >
        <div className="size-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-500" />
      </div>
    );
  }

  const viewProps: ViewProps = {
    user,
    logout,
    activeTab,
    setActiveTab,
    experiences,
    requests,
    stats,
    onEdit: handleEdit,
    onDelete: handleDelete,
    editing,
    onEditChange: handleEditChange,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: handleCancelEdit,
    editingProfile,
    profileDisplayName,
    profileBio,
    currentPassword,
    newPassword,
    confirmPassword,
    avatarPreview,
    onToggleProfileEdit: handleToggleProfileEdit,
    onProfileFieldChange: handleProfileFieldChange,
    onPasswordFieldChange: handlePasswordFieldChange,
    onSaveProfile: handleSaveProfile,
    onChangePassword: handleChangePassword,
    onAvatarChange: handleAvatarChange,
    onCancelProfileEdit: handleCancelProfileEdit,
  };

  if (isMobile) {
    return <MobileDashboardView {...viewProps} />;
  }

  return <DesktopDashboardView {...viewProps} />;
};

export { Dashboard };
