import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toasts: Toast[];
  toast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = nextId;
    nextId += 1;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      <div
        className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2"
        dir="rtl"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${(() => {
              if (t.type === 'success')
                return 'border-green-200 bg-green-50 text-green-700';
              if (t.type === 'error')
                return 'border-red-200 bg-red-50 text-red-700';
              return 'border-blue-200 bg-blue-50 text-blue-700';
            })()}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
