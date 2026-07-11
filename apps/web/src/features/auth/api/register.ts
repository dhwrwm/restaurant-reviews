import { fetcher } from "@/lib/fetcher";
import type { Role } from "types";

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export function register(payload: RegisterRequest) {
  return fetcher<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
