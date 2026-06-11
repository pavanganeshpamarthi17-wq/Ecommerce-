import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, maxStars = 5, size = 'sm', interactive = false, onChange }) => {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          >
            <Star
              className={`${sizes[size]} ${
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : half
                  ? 'fill-yellow-200 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
