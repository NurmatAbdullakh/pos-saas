import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthResponse, AuthUser, LoginCredentials, RegisterCredentials } from "../types/auth.types";
import {
  getCurrentUser,
  loginWithApple,
  loginWithFacebook,
  loginWithGoogle,
  loginWithPassword,
  registerAccount,
  logout as logoutRequest,
  refreshSession,
} from "../api/auth.api";

type AuthStatus = "loading" | "signed-out" | "signed-in";

interface UseAuthResult {
  accessToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  isLoading: boolean;
  error: string;
  clearError: () => void;
  signInWithPassword: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithFacebook: (token: string) => Promise<void>;
  signInWithApple: (input: {
    code: string;
    nonce: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  setAuthError: (message: string) => void;
}

export function useAuth(): UseAuthResult {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const restoreStarted = useRef(false);

  const establishSession = useCallback((response: AuthResponse) => {
    setAccessToken(response.accessToken);
    setUser(response.user);
    setStatus("signed-in");
  }, []);

  const runAuthentication = useCallback(async (request: () => Promise<AuthResponse>) => {
    setIsLoading(true);
    setError("");
    try {
      establishSession(await request());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  }, [establishSession]);

  const signInWithPassword = useCallback(
    (credentials: LoginCredentials) => runAuthentication(() => loginWithPassword(credentials)),
    [runAuthentication],
  );

  const signUp = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError("");
    try {
      await registerAccount(credentials);
      const response = await loginWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      establishSession(response);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create your account.");
    } finally {
      setIsLoading(false);
    }
  }, [establishSession]);

  const signInWithGoogle = useCallback(
    (idToken: string) => runAuthentication(() => loginWithGoogle(idToken)),
    [runAuthentication],
  );

  const signInWithFacebook = useCallback(
    (token: string) => runAuthentication(() => loginWithFacebook(token)),
    [runAuthentication],
  );

  const signInWithApple = useCallback(
    (input: { code: string; nonce: string; firstName?: string; lastName?: string }) =>
      runAuthentication(() => loginWithApple(input)),
    [runAuthentication],
  );

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;

    const restore = async () => {
      try {
        const token = await refreshSession();
        const currentUser = await getCurrentUser(token);
        establishSession({ accessToken: token, user: currentUser });
      } catch {
        setStatus("signed-out");
      }
    };

    void restore();
  }, [establishSession]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutRequest(accessToken);
    } catch {
      // Always clear the local session; the refresh cookie may already be invalid.
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus("signed-out");
      setError("");
      setIsLoading(false);
    }
  }, [accessToken]);

  const clearError = useCallback(() => setError(""), []);
  const setAuthError = useCallback((message: string) => setError(message), []);

  return {
    accessToken,
    user,
    status,
    isLoading,
    error,
    clearError,
    signInWithPassword,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    signOut,
    setAuthError,
  };
}
