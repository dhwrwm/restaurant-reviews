import { cookies } from "next/headers";
import { RestaurantsPage } from "./get-restaurants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const AUTH_COOKIE = "auth";

const emptyPage = (page: number, pageSize: number): RestaurantsPage => ({
  data: [],
  pagination: { page, pageSize, total: 0, totalPages: 0 },
});

export async function getMyRestaurants({
  page = 1,
  pageSize = 10,
}: { page?: number; pageSize?: number } = {}): Promise<RestaurantsPage> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE);

  if (!authCookie) {
    return emptyPage(page, pageSize);
  }

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  const response = await fetch(`${API_BASE_URL}/restaurants/mine?${params}`, {
    headers: {
      Cookie: `${AUTH_COOKIE}=${authCookie.value}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load your restaurants. Please try again.");
  }

  return response.json();
}
