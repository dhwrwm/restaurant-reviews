"use client";

import { Star } from "lucide-react";

type StarRatingProps = {
  rating?: number;
  onChangeRating?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
  className?: string;
};

const MAX_RATING = 5;

export default function StarRating({
  rating = 0,
  onChangeRating,
  readOnly = false,
  size = 20,
  className,
}: StarRatingProps) {
  const interactive = !!onChangeRating && !readOnly;

  return (
    <div className={`flex items-center gap-0.5 ${className ?? ""}`}>
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const star = index + 1;

        const fill = rating >= star ? 100 : rating >= star - 0.5 ? 50 : 0;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChangeRating?.(star)}
            className={
              interactive
                ? "cursor-pointer transition-transform hover:scale-110"
                : "cursor-default"
            }
          >
            <div className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="absolute text-muted-foreground" />

              {fill > 0 && (
                <div
                  className="absolute overflow-hidden"
                  style={{ width: `${fill}%` }}
                >
                  <Star
                    size={size}
                    className="fill-yellow-400 text-yellow-400"
                  />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
