import { fetcher } from "@/lib/fetcher";

export function logout() {
  return fetcher<{ message: string }>("/auth/logout", { method: "POST" });
}
