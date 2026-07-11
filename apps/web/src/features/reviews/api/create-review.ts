import { fetcher } from "@/lib/fetcher";

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  restaurantId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export function createReview(
  restaurantSlug: string,
  payload: CreateReviewRequest,
) {
  return fetcher<ReviewResponse>(`/restaurants/${restaurantSlug}/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
