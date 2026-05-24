interface ProductRatingProps {
  averageRating?: number;
  ratingCount?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
}

export default function ProductRating({
  averageRating = 0,
  ratingCount = 0,
  size = 'sm',
  showCount = true,
}: ProductRatingProps) {
  if (!ratingCount || ratingCount === 0) {
    return null;
  }

  const starSize = size === 'md' ? 'text-[20px]' : 'text-[14px]';
  const textSize = size === 'md' ? 'text-sm' : 'text-[11px]';
  const rounded = Math.round(averageRating * 2) / 2;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-symbols-outlined ${starSize} ${
              star <= Math.floor(rounded)
                ? 'text-amber-400'
                : star - 0.5 <= rounded
                  ? 'text-amber-400'
                  : 'text-slate-200'
            }`}
            style={{
              fontVariationSettings: star <= rounded ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            star
          </span>
        ))}
      </div>
      {showCount && (
        <span className={`${textSize} font-bold text-[#1a2f1a]/50`}>
          {averageRating.toFixed(1)} ({ratingCount})
        </span>
      )}
    </div>
  );
}
