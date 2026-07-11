import type { Cuisine } from "types";

export type { Cuisine };

export interface Restaurant {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  description: string;
  previewImageUrl: string | null;
  address: string;
  city: string;
  state: string | null;
  country: string;
  cuisine: Cuisine;
  averageRating: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
