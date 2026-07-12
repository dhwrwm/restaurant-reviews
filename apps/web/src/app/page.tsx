import { RestaurantFilters } from "@/features/restaurants/components/restaurant-filters";
import { getRestaurants } from "@/features/restaurants/api/get-restaurants";
import { RestaurantCard } from "@/features/restaurants/components/restaurant-card";
import { Pagination } from "@/components/ui/pagination";
import { Cuisine } from "@/features/restaurants/types";

interface HomeProps {
  searchParams: Promise<{
    page?: string;
    city?: string;
    cuisine?: string;
    minRating?: string;
    sort?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { page, city, cuisine, minRating, sort } = await searchParams;
  const { data: restaurants, pagination } = await getRestaurants({
    page: page ? Number(page) : undefined,
    city,
    cuisine: cuisine as Cuisine | undefined,
    minRating: minRating ? Number(minRating) : undefined,
    sort: sort === "asc" ? "asc" : sort === "desc" ? "desc" : undefined,
  });

  return (
    <>
      <div className="my-10">
        <RestaurantFilters />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
        {restaurants.map((restaurant, index) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            priority={index < 4}
          />
        ))}
      </div>

      <div className="my-10">
        <Pagination pagination={pagination} />
      </div>
    </>
  );
}
