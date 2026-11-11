export type AuthProvider = "google" | "facebook" | "apple" | "password";
export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
  authProvider: AuthProvider;
}
export interface LoginCredentials { email: string; password: string; }
export interface AuthResponse { accessToken: string; user: AuthUser; }
export interface ApiEnvelope<T> { success: boolean; message?: string; data: T; }
