import { Cuisine, Restaurant } from "../types";
import { Pagination } from "@/types/pagination";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface RestaurantsPage {
  data: Restaurant[];
  pagination: Pagination;
}

interface GetRestaurantsOptions {
  page?: number;
  pageSize?: number;
  city?: string;
  cuisine?: Cuisine;
  minRating?: number;
  sort?: "asc" | "desc";
}

export async function getRestaurants({
  page = 1,
  pageSize = 12,
  city,
  cuisine,
  minRating,
  sort,
}: GetRestaurantsOptions = {}): Promise<RestaurantsPage> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (city) params.set("city", city);
  if (cuisine) params.set("cuisine", cuisine);
  if (minRating !== undefined) params.set("minRating", String(minRating));
  if (sort) params.set("sort", sort);

  const response = await fetch(`${API_BASE_URL}/restaurants?${params}`, {
    next: { revalidate: 15 },
  });

  if (!response.ok) {
    throw new Error("Failed to load restaurants. Please try again.");
  }

  return response.json();
}
