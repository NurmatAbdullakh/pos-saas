import type { ApiEnvelope, AuthResponse, AuthUser, LoginCredentials } from "../types/auth.types";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";

async function post<T>(path: string, body?: unknown, accessToken?: string): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: "include",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(await getApiErrorMessage(response));
  return (await response.json()) as T;
}

export async function loginWithPassword(credentials: LoginCredentials): Promise<AuthResponse> {
  return (await post<ApiEnvelope<AuthResponse>>("/api/auth/login", credentials)).data;
}
export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return (await post<ApiEnvelope<AuthResponse>>("/api/auth/google", { idToken })).data;
}
export async function loginWithFacebook(accessToken: string): Promise<AuthResponse> {
  return (await post<ApiEnvelope<AuthResponse>>("/api/auth/facebook", { accessToken })).data;
}
export async function loginWithApple(input: {code:string;nonce:string;firstName?:string;lastName?:string}): Promise<AuthResponse> {
  return (await post<ApiEnvelope<AuthResponse>>("/api/auth/apple", input)).data;
}

export interface PhoneOtpRequest {
  challengeId: string;
  status: "otp_sent";
  expiresIn: number;
}
export async function requestPhoneOtp(phoneNumber: string, telegramConsent: boolean): Promise<PhoneOtpRequest> {
  return (await post<ApiEnvelope<PhoneOtpRequest>>("/api/auth/phone/request-otp", { phoneNumber, telegramConsent })).data;
}
export async function verifyPhoneOtp(input: {challengeId:string;phoneNumber:string;code:string}): Promise<AuthResponse> {
  return (await post<ApiEnvelope<AuthResponse>>("/api/auth/phone/verify-otp", input)).data;
}

export async function refreshSession(): Promise<string> {
  const result = await post<{ accessToken: string }>("/api/auth/refresh");
  return result.accessToken;
}
export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  const response = await fetch("/api/me", { headers: { Authorization: `Bearer ${accessToken}` }, credentials: "include" });
  if (!response.ok) throw new Error(await getApiErrorMessage(response));
  return ((await response.json()) as ApiEnvelope<AuthUser>).data;
}
export async function logout(accessToken: string | null): Promise<void> {
  await post<unknown>("/api/auth/logout", undefined, accessToken ?? undefined);
}
