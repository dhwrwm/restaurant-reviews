import { Star } from "lucide-react";

interface StarRatingDisplayProps {
  rating?: number;
  size?: number;
  className?: string;
}

const MAX_RATING = 5;

export default function StarRatingDisplay({
  rating = 0,
  size = 20,
  className,
}: StarRatingDisplayProps) {
  return (
    <div
      role="img"
      aria-label={`${rating} out of ${MAX_RATING} stars`}
      className={`flex items-center gap-0.5 ${className ?? ""}`}
    >
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const star = index + 1;
        const fill = rating >= star ? 100 : rating >= star - 0.5 ? 50 : 0;

        return (
          <div
            key={star}
            aria-hidden="true"
            className="relative"
            style={{ width: size, height: size }}
          >
            <Star size={size} className="absolute text-muted-foreground" />

            {fill > 0 && (
              <div
                className="absolute overflow-hidden"
                style={{ width: `${fill}%` }}
              >
                <Star size={size} className="fill-yellow-400 text-yellow-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
