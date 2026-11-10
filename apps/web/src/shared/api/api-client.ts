import { getApiErrorMessage } from "./getApiErrorMessage";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function apiRequest<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;
  const payload = await response.json() as T | ApiEnvelope<T>;
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export function jsonBody(value: unknown): Pick<RequestInit, "method" | "body"> {
  return { method: "POST", body: JSON.stringify(value) };
}
