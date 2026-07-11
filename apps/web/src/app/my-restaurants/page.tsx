import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "types";
import { getCurrentUser } from "@/features/auth/api/me";
import { getMyRestaurants } from "@/features/restaurants/api/get-my-restaurants";
import { MyRestaurantListItem } from "@/features/restaurants/components/my-restaurant-list-item";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "My Restaurants",
  robots: { index: false, follow: false },
};

interface MyRestaurantsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MyRestaurantsPage({
  searchParams,
}: MyRestaurantsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== Role.OWNER) {
    redirect("/");
  }

  const { page } = await searchParams;
  const { data: restaurants, pagination } = await getMyRestaurants({
    page: page ? Number(page) : undefined,
  });

  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-bold text-2xl md:text-3xl text-gray-800">
          My Restaurants
        </h1>
        <Link
          href="/add-restaurant"
          className="py-2 px-4 bg-primary rounded-md text-xs text-primary-foreground uppercase"
        >
          Add Restaurant
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <p className="text-gray-500">
          You haven&apos;t added any restaurants yet.
        </p>
      ) : (
        <div>
          {restaurants.map((restaurant) => (
            <MyRestaurantListItem key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <Pagination pagination={pagination} />
      </div>
    </div>
  );
}
