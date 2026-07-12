import type { Metadata } from "next";
import { getRestaurant } from "@/features/restaurants/api/get-restaurant";
import RestaurantReviews from "@/features/reviews/components/restaurant-reviews";
import RestaurantReviewsSkeleton from "@/features/reviews/components/restaurant-reviews-skeleton";
import StarRating from "@/features/restaurants/components/star-rating";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    return { title: "Restaurant not found" };
  }

  const description = `${restaurant.name} in ${restaurant.city} — ${restaurant.cuisine.toLowerCase()} cuisine, rated ${Number(restaurant.averageRating ?? 0).toFixed(1)}/5 from ${restaurant.reviewCount} review${restaurant.reviewCount === 1 ? "" : "s"}.`;

  return {
    title: restaurant.name,
    description,
    openGraph: {
      title: restaurant.name,
      description,
      images: restaurant.previewImageUrl
        ? [restaurant.previewImageUrl]
        : undefined,
    },
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl mt-16 flex items-center">
        <h2 className="font-bold text-3xl text-gray-800">{restaurant.name}</h2>
        <div className="ml-4 select-none">
          <StarRating rating={Number(restaurant.averageRating ?? 0)} readOnly />
        </div>
      </div>

      <div className="mx-auto max-w-6xl text-gray-500 text-sm mb-4 font-semibold">
        {[
          restaurant.address,
          restaurant.city,
          restaurant.state,
          restaurant.country,
        ]
          .filter(Boolean)
          .join(", ")}
      </div>

      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-justify text-gray-800">{restaurant.description}</p>
        </div>
        <div className="relative w-full aspect-video">
          <Image
            src={restaurant.previewImageUrl ?? "/restaurant1.jpg"}
            alt={restaurant.name}
            fill
            preload
            className="rounded-lg shadow-lg object-cover"
            sizes="(max-width: 1200px) 100vw, 50vw"
          />
        </div>
      </div>
      <div className="mx-auto max-w-6xl mt-8">
        <Suspense fallback={<RestaurantReviewsSkeleton />}>
          <RestaurantReviews slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}
