import { fetcher } from "@/lib/fetcher";
import { Cuisine, Restaurant } from "../types";

export interface CreateRestaurantRequest {
  name: string;
  description?: string;
  previewImageUrl?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  cuisine: Cuisine;
}

export function createRestaurant(payload: CreateRestaurantRequest) {
  return fetcher<Restaurant>("/restaurants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
