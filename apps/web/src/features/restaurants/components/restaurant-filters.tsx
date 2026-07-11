import { CUISINE_OPTIONS } from "types";
import { RestaurantFilterInput } from "./restaurant-filter-input";
import { RestaurantFilterCities } from "./restaurant-filter-cities";
import { RestaurantSortSelect } from "./restaurant-sort-select";
import { Suspense } from "react";

const ratings = [
  { value: "5", label: "5" },
  { value: "4", label: "4+" },
  { value: "3", label: "3+" },
  { value: "2", label: "2+" },
  { value: "1", label: "1+" },
];

export function RestaurantFilters() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <RestaurantFilterInput
        label="Cuisine"
        queryKey="cuisine"
        placeholder="Any"
        options={CUISINE_OPTIONS}
      />
      <RestaurantFilterInput
        label="Average rating"
        queryKey="minRating"
        placeholder="Any"
        options={ratings}
      />
      <Suspense fallback="Loading..">
        <RestaurantFilterCities />
      </Suspense>
      <RestaurantSortSelect />
    </div>
  );
}
