import { fetcher } from "@/lib/fetcher";
import type { Role } from "types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

export function login(payload: LoginRequest) {
  return fetcher<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
