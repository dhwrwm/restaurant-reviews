import { cookies } from "next/headers";
import type { Role } from "types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const AUTH_COOKIE = "auth";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE);

  if (!authCookie) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Cookie: `${AUTH_COOKIE}=${authCookie.value}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
