import { Restaurant } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function getRestaurant(slug: string): Promise<Restaurant | null> {
  const response = await fetch(`${API_BASE_URL}/restaurants/${slug}`, {
    next: { revalidate: 15 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load restaurant. Please try again.");
  }

  return response.json();
}
