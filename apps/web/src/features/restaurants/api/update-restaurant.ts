import { fetcher } from "@/lib/fetcher";
import { Cuisine, Restaurant } from "../types";

export interface UpdateRestaurantRequest {
  name?: string;
  description?: string;
  previewImageUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  cuisine?: Cuisine;
}

export function updateRestaurant(id: string, payload: UpdateRestaurantRequest) {
  return fetcher<Restaurant>(`/restaurants/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
