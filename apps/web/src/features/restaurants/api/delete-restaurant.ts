import { fetcher } from "@/lib/fetcher";

export function deleteRestaurant(id: string) {
  return fetcher<void>(`/restaurants/${id}`, {
    method: "DELETE",
  });
}
