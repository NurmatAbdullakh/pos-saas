import type { ApiEnvelope, AuthResponse, LoginCredentials } from "../types/auth.types";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";

export async function loginWithPassword(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  const result = (await response.json()) as ApiEnvelope<AuthResponse>;
  return result.data;
}
