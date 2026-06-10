import { useState } from 'react';

const StarRating = ({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`text-lg transition-all duration-150 ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${star <= (hover || value) ? 'text-amber-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export { StarRating };
