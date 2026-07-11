import { getCurrentUser } from "@/features/auth/api/me";
import { getRestaurantReviews } from "../api/get-restaurant-reviews";
import { Review } from "./review";
import { ReviewsList } from "./reviews-list";
import { WriteReview } from "./write-review";

export default async function RestaurantReviews({ slug }: { slug: string }) {
  const [reviews, user] = await Promise.all([
    getRestaurantReviews(slug),
    getCurrentUser(),
  ]);

  return (
    <>
      <WriteReview restaurantSlug={slug} user={user} />

      <h2 className="font-semibold text-2xl text-gray-700 my-4">Reviews</h2>
      <ReviewsList
        slug={slug}
        initialCursor={reviews.nextCursor}
        currentUserId={user?.id}
      >
        {reviews.items.map((r) => (
          <Review
            key={r.id}
            id={r.id}
            restaurantSlug={slug}
            reviewerId={r.reviewerId}
            currentUserId={user?.id}
            author={r.reviewer.name}
            date={r.createdAt}
            rating={r.rating}
            body={r.comment}
          />
        ))}
      </ReviewsList>
    </>
  );
}
