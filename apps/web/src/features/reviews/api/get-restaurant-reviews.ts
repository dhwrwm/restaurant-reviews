import { Reviews } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface ReviewsPage {
  items: Reviews[];
  nextCursor: string | null;
}

interface GetRestaurantReviewsOptions {
  cursor?: string;
  limit?: number;
}

export async function getRestaurantReviews(
  slug: string,
  { cursor, limit }: GetRestaurantReviewsOptions = {},
): Promise<ReviewsPage> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const query = params.toString();

  const response = await fetch(
    `${API_BASE_URL}/restaurants/${slug}/reviews${query ? `?${query}` : ""}`,
    { next: { revalidate: 15 } },
  );

  if (!response.ok) {
    throw new Error("Failed to load reviews. Please try again.");
  }

  return response.json();
}
