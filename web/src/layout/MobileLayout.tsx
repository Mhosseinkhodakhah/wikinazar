import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, type ReactNode } from 'react';

import { LoginModal } from '../components/LoginModal';
import { useAuth } from '../utils/AuthContext';

type Props = {
  children: ReactNode;
};

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="size-5"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 0 : 2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="size-5"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 0 : 2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function PlusIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="size-5"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 0 : 2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  );
}

function ClipboardIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="size-5"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 0 : 2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="size-5"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 0 : 2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function LockIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="size-5"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 0 : 2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

const MobileLayout = ({ children }: Props) => {
  const router = useRouter();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const tabs = [
    { href: '/', label: 'خانه', icon: HomeIcon },
    { href: '/subjects', label: 'موضوعات', icon: GridIcon },
    { href: '/submit', label: 'ثبت', icon: PlusIcon },
    { href: '/requests', label: 'درخواست‌ها', icon: ClipboardIcon },
    {
      href: user ? '/dashboard' : undefined,
      label: user ? 'پروفایل' : 'ورود',
      icon: user ? UserIcon : LockIcon,
      onClick: user ? undefined : () => setShowLogin(true),
    },
  ];

  return (
    <div className="mobile-layout min-h-screen bg-gray-50 pb-16">
      <main className="mx-auto max-w-lg">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white shadow-lg">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
          {tabs.map((tab) => {
            const isActive = tab.href
              ? tab.href === '/'
                ? router.pathname === '/'
                : router.pathname.startsWith(tab.href)
              : false;

            if (tab.onClick) {
              return (
                <button
                  key={tab.label}
                  onClick={tab.onClick}
                  className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all text-gray-400 hover:text-gray-600"
                >
                  <tab.icon active={false} />
                  {tab.label}
                </button>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href!}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all ${
                  isActive
                    ? 'text-teal-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <tab.icon active={isActive} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export { MobileLayout };
