import { useState } from 'react';

import { useAuth } from '../utils/AuthContext';

type Props = {
  open: boolean;
  onClose: () => void;
};

const LoginModal = ({ open, onClose }: Props) => {
  const { login, register } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setDisplayName('');
    setError(null);
    setBusy(false);
    setTab('login');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('ایمیل و رمز عبور را وارد کنید');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ورود');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password || !username.trim()) {
      setError('ایمیل، نام کاربری و رمز عبور را وارد کنید');
      return;
    }
    if (password.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(
        email.trim(),
        username.trim(),
        password,
        displayName.trim() || undefined,
      );
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت‌نام');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-gray-300 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-center">
          <div className="mb-2 text-2xl">🔐</div>
          <h3 className="text-lg font-bold text-gray-800">
            {tab === 'login' ? 'ورود به ویکی‌نظر' : 'ثبت‌نام در ویکی‌نظر'}
          </h3>
          <p className="mt-1 text-xs text-gray-600">
            {tab === 'login'
              ? 'با حساب کاربری خود وارد شوید'
              : 'حساب کاربری جدید بسازید'}
          </p>
        </div>

        <div className="mb-4 flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === 'login'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ورود
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === 'register'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ثبت‌نام
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              ایمیل
            </label>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="example@email.com"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:outline-none"
            />
          </div>

          {tab === 'register' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  نام کاربری
                </label>
                <input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  placeholder="username"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  نام نمایشی (اختیاری)
                </label>
                <input
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setError(null);
                  }}
                  placeholder="نام شما"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              رمز عبور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (tab === 'login') handleLogin();
                  else handleRegister();
                }
              }}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-teal-300 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={tab === 'login' ? handleLogin : handleRegister}
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {(() => {
              if (busy) return 'لطفاً صبر کنید...';
              return tab === 'login' ? 'ورود' : 'ثبت‌نام';
            })()}
          </button>
        </div>

        <button
          onClick={handleClose}
          className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700"
        >
          بستن
        </button>
      </div>
    </div>
  );
};

export { LoginModal };
