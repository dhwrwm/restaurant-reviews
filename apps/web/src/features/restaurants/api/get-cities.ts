const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function getCities(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/restaurants/cities`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Failed to load cities. Please try again.");
  }

  return response.json();
}
