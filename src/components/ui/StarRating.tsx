import React from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number; // 1 to 5
  maxStars?: number;
  totalReviews?: number;
  size?: 'sm' | 'base';
  showNumber?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  totalReviews,
  size = 'sm',
  showNumber = false,
  className = '',
}) => {
  const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <div className="flex items-center gap-0.5 text-accent" aria-label={`Rated ${rating} out of ${maxStars} stars`}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const isFilled = index < Math.floor(rating);
          const isHalf = !isFilled && index < rating;

          return (
            <Star
              key={index}
              className={`${starSize} ${
                isFilled
                  ? 'fill-accent text-accent'
                  : isHalf
                  ? 'fill-accent/50 text-accent'
                  : 'text-line stroke-[1.2]'
              }`}
            />
          );
        })}
      </div>

      {showNumber && (
        <span className="text-xs text-ink font-medium">
          {rating.toFixed(1)}
        </span>
      )}

      {typeof totalReviews === 'number' && (
        <span className="text-[11px] text-muted font-light">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
