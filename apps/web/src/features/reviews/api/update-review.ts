import { fetcher } from "@/lib/fetcher";
import { CreateReviewRequest, ReviewResponse } from "./create-review";

export function updateReview(id: string, payload: CreateReviewRequest) {
  return fetcher<ReviewResponse>(`/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
