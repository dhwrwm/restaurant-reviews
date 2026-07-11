import { fetcher } from "@/lib/fetcher";

export function deleteReview(id: string) {
  return fetcher<void>(`/reviews/${id}`, {
    method: "DELETE",
  });
}
