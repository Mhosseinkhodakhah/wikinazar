import { useEffect } from 'react';

const Lightbox = ({ src, onClose }: { src: string; onClose: () => void }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <img
        src={src}
        alt=""
        className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute left-4 top-4 rounded-xl bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-all hover:bg-white/20"
      >
        ✕ بستن
      </button>
    </div>
  );
};

export { Lightbox };
