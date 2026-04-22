import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;         // current rating (1–5)
  onChange?: (v: number) => void; // if provided = interactive
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;        // number of reviews (shown alongside avg)
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };

const StarRating: React.FC<StarRatingProps> = ({
  value, onChange, size = 'md', showValue = false, count,
}) => {
  const [hover, setHover] = React.useState(0);
  const interactive = !!onChange;
  const display = interactive ? (hover || value) : value;
  const cls = sizes[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            className={`transition ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`${cls} ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-100'}`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="text-sm font-semibold text-gray-700 ml-1">
          {value > 0 ? value.toFixed(1) : '—'}
          {count !== undefined && (
            <span className="text-gray-400 font-normal text-xs ml-1">({count})</span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
