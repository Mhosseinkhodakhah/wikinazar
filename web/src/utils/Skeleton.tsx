const SkeletonCard = ({ compact }: { compact?: boolean }) => (
  <div
    className={`animate-pulse overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm ${compact ? 'border-black shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : ''}`}
  >
    <div
      className={`w-full bg-gray-200 ${compact ? 'h-24 md:h-28' : 'h-36 md:h-44'}`}
    />
    <div className="p-2.5 md:p-3">
      <div className="mb-2 h-3 w-3/4 rounded bg-gray-200" />
      <div className="mb-3 h-2 w-1/2 rounded bg-gray-100" />
      <div className="mb-2 h-2 w-full rounded bg-gray-100" />
      <div className="flex gap-1">
        <div className="h-4 w-12 rounded bg-gray-100" />
        <div className="h-4 w-12 rounded bg-gray-100" />
        <div className="h-4 w-12 rounded bg-gray-100" />
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
        <div className="h-3 w-16 rounded bg-gray-200" />
        <div className="size-6 rounded bg-gray-100" />
      </div>
    </div>
  </div>
);

export { SkeletonCard };
