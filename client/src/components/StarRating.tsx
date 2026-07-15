interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export default function StarRating({ stars, maxStars = 3, size = 'md', showLabel = false }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${sizeMap[size]} ${
            i < stars ? 'text-secondary' : 'text-surface-variant'
          }`}
          style={{ fontVariationSettings: i < stars ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
      {showLabel && (
        <span className="ml-1 font-label-md text-label-md text-on-surface-variant">
          {stars}/{maxStars}
        </span>
      )}
    </div>
  );
}
