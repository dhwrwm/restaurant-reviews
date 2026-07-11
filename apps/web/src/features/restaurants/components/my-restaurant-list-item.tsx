import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Restaurant } from "../types";
import StarRatingDisplay from "./star-rating-display";
import { DeleteRestaurantButton } from "./delete-restaurant-button";

export function MyRestaurantListItem({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  return (
    <div className="flex flex-col gap-2 bg-base-100 rounded-lg p-4 border border-gray-200 py-4 sm:flex-row sm:items-center sm:justify-between my-2">
      <div>
        <Link
          href={`/restaurant/${restaurant.slug}`}
          className="text-lg font-semibold text-gray-800 hover:underline"
        >
          {restaurant.name}
        </Link>
        <p className="text-sm text-gray-500">
          {[restaurant.city, restaurant.state, restaurant.country]
            .filter(Boolean)
            .join(", ")}
        </p>
        <div className="mt-1">
          <StarRatingDisplay rating={Number(restaurant.averageRating ?? 0)} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/my-restaurants/${restaurant.slug}/edit`} />}
        >
          Edit
        </Button>
        <DeleteRestaurantButton id={restaurant.id} name={restaurant.name} />
      </div>
    </div>
  );
}
