import Image from "next/image";
import Link from "next/link";
import { Restaurant } from "../types";
import StarRatingDisplay from "./star-rating-display";

export function RestaurantCard({
  restaurant,
  priority = false,
}: {
  restaurant: Restaurant;
  priority?: boolean;
}) {
  return (
    <div className="bg-base-100 shadow-xl rounded-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
      <div className="relative w-full aspect-video">
        <Image
          src={restaurant.previewImageUrl ?? "/restaurant1.jpg"}
          alt={restaurant.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
        />
      </div>
      <div className="p-2">
        <h2 className="px-2 mb-1 mt-1 leading-none text-lg font-semibold text-gray-600">
          {restaurant.name}
        </h2>
        <p className="px-2 leading-none text-sm text-gray-500 line-clamp-2 md:line-clamp-3">
          {restaurant.description}
        </p>
        <div className="flex justify-between px-2 mt-5">
          <div>
            <StarRatingDisplay
              rating={Number(restaurant?.averageRating ?? 0)}
            />
          </div>
          <Link
            href={`/restaurant/${restaurant.slug}`}
            className="py-2 px-4 bg-primary rounded-md text-xs text-primary-foreground uppercase"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
