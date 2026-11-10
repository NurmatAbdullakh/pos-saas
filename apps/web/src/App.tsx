import { useCallback, useEffect, useRef, useState } from "react";
import { LoginPage } from "./features/auth/components/LoginPage";
import { DashboardPage } from "./features/dashboard/components/DashboardPage";
import type { AuthUser, LoginCredentials } from "./features/auth/types/auth.types";
import { loginWithPassword as authenticateWithPassword } from "./features/auth/api/auth.api";
import { getApiErrorMessage } from "./shared/api/getApiErrorMessage";

type User = AuthUser;
interface ApiEnvelope<T> { success: boolean; message?: string; data: T }
interface AuthResponse { accessToken: string; user: User }
interface GoogleCredentialResponse { credential: string }
interface GoogleIdentity {
  initialize(options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void;
  renderButton(parent: HTMLElement, options: {
    theme: "outline"; size: "large"; shape: "rectangular"; text: "continue_with"; width: number;
  }): void;
}
interface FacebookLoginResponse { authResponse?: { accessToken: string; userID: string } }
interface AppleAuthorizationResponse {
  authorization: { code: string; state: string; id_token?: string };
  user?: { name?: { firstName?: string; lastName?: string }; email?: string };
}
interface AppleAuthSdk {
  init(options: { clientId: string; scope: string; redirectURI: string; state: string; nonce: string; usePopup: boolean }): void;
  signIn(): Promise<AppleAuthorizationResponse>;
}
interface FacebookSdk {
  init(options: { appId: string; version: string; xfbml: boolean }): void;
  login(callback: (response: FacebookLoginResponse) => void, options: { scope: string }): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
    FB?: FacebookSdk;
    AppleID?: { auth: AppleAuthSdk };
    fbAsyncInit?: () => void;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined;
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI as string | undefined;


export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "signed-out" | "signed-in">("loading");
  const [googleReady, setGoogleReady] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const restoreStarted = useRef(false);

  const loadCurrentUser = useCallback(async (token: string) => {
    const response = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    if (!response.ok) throw new Error(await getApiErrorMessage(response));
    const result = (await response.json()) as ApiEnvelope<User>;
    setUser(result.data);
    setAccessToken(token);
    setStatus("signed-in");
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
      if (!response.ok) { setStatus("signed-out"); return; }
      const result = (await response.json()) as { accessToken: string };
      await loadCurrentUser(result.accessToken);
    } catch { setStatus("signed-out"); }
  }, [loadCurrentUser]);

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;
    void restoreSession();
  }, [restoreSession]);

  const completeSocialLogin = useCallback(async (
    provider: "google" | "facebook",
    credentials: { idToken: string } | { accessToken: string },
  ) => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error(await getApiErrorMessage(response));
      const result = (await response.json()) as ApiEnvelope<AuthResponse>;
      setAccessToken(result.data.accessToken);
      setUser(result.data.user);
      setStatus("signed-in");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `${provider} sign-in failed.`);
    } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    // The login form (and its ref) is not mounted while the session is restoring.
    // Initialize Google only after the signed-out UI has rendered.
    if (status !== "signed-out") {
      console.debug("[Google Auth] waiting for signed-out screen before initializing", { status });
      return;
    }

    console.debug("[Google Auth] effect started", {
      clientIdConfigured: Boolean(GOOGLE_CLIENT_ID),
      sdkAvailable: Boolean(window.google?.accounts?.id),
      buttonRefAvailable: Boolean(googleButtonRef.current),
    });

    if (!GOOGLE_CLIENT_ID) {
      console.warn("[Google Auth] VITE_GOOGLE_CLIENT_ID is missing.");
      return;
    }

    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initializeGoogle = () => {
      console.debug("[Google Auth] initialize callback fired", {
        sdkAvailable: Boolean(window.google?.accounts?.id),
        buttonRefAvailable: Boolean(googleButtonRef.current),
      });

      if (!window.google?.accounts?.id) {
        console.error("[Google Auth] SDK callback fired, but window.google.accounts.id is unavailable.");
        return;
      }
      if (!googleButtonRef.current) {
        console.error("[Google Auth] SDK is ready, but googleButtonRef.current is null.");
        return;
      }

      try {
        console.debug("[Google Auth] calling google.accounts.id.initialize");
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (credential) => {
            console.debug("[Google Auth] credential callback received", {
              credentialPresent: Boolean(credential.credential),
            });
            if (!credential.credential) {
              console.error("[Google Auth] Google returned an empty credential.");
              return;
            }
            void completeSocialLogin("google", { idToken: credential.credential });
          },
        });
        console.debug("[Google Auth] initialize completed");

        googleButtonRef.current.innerHTML = "";
        console.debug("[Google Auth] calling google.accounts.id.renderButton");
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline", size: "large", shape: "rectangular", text: "continue_with", width: 320,
        });
        console.debug("[Google Auth] renderButton completed");
        setGoogleReady(true);
      } catch (cause) {
        console.error("[Google Auth] initialization/rendering failed", cause);
      }
    };

    if (!script) {
      console.debug("[Google Auth] SDK script not found; creating script element.");
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.debug("[Google Auth] SDK script load event fired.");
        initializeGoogle();
      };
      script.onerror = (event) => {
        console.error("[Google Auth] SDK script failed to load.", event);
      };
      document.head.appendChild(script);
    } else if (window.google?.accounts?.id) {
      console.debug("[Google Auth] SDK script already exists and SDK global is available.");
      initializeGoogle();
    } else {
      console.debug("[Google Auth] SDK script exists but SDK global is not available yet; waiting for load event.", {
      });
      script.addEventListener("load", initializeGoogle);
      script.addEventListener("error", (event) => {
        console.error("[Google Auth] Existing SDK script emitted an error.", event);
      }, { once: true });
    }

    return () => {
      console.debug("[Google Auth] effect cleanup.");
      script?.removeEventListener("load", initializeGoogle);
    };
  }, [completeSocialLogin, status]);

  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;
    const scriptId = "facebook-jssdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const initializeFacebook = () => {
      if (!window.FB) return;
      window.FB.init({ appId: FACEBOOK_APP_ID, version: "v26.0", xfbml: false });
      setFacebookReady(true);
    };
    window.fbAsyncInit = initializeFacebook;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else if (window.FB) initializeFacebook();
    return () => {
      if (window.fbAsyncInit === initializeFacebook) delete window.fbAsyncInit;
    };
  }, []);

  const loginWithPassword = async (credentials: LoginCredentials) => {
    setBusy(true);
    setError("");
    try {
      const result = await authenticateWithPassword(credentials);
      setAccessToken(result.accessToken);
      setUser(result.user);
      setStatus("signed-in");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  const loginWithFacebook = () => {
    if (!window.FB || busy) return;
    setError("");
    window.FB.login((response) => {
      const token = response.authResponse?.accessToken;
      if (!token) {
        setError("Facebook sign-in was cancelled or permission was not granted.");
        return;
      }
      void completeSocialLogin("facebook", { accessToken: token });
    }, { scope: "email,public_profile" });
  };

  useEffect(() => {
    if (!APPLE_CLIENT_ID || !APPLE_REDIRECT_URI) return;
    const scriptId = "apple-signin-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const initializeApple = () => {
      if (window.AppleID) setAppleReady(true);
    };
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      script.onload = initializeApple;
      document.head.appendChild(script);
    } else if (window.AppleID) initializeApple();
    else script.addEventListener("load", initializeApple);
    return () => script?.removeEventListener("load", initializeApple);
  }, []);

  const loginWithApple = async () => {
    if (!window.AppleID || busy || !APPLE_CLIENT_ID || !APPLE_REDIRECT_URI) return;
    setError("");
    const nonce = crypto.randomUUID().replace(/-/g, "");
    const state = crypto.randomUUID().replace(/-/g, "");
    try {
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID, scope: "name email",
        redirectURI: APPLE_REDIRECT_URI, state, nonce, usePopup: true,
      });
      const response = await window.AppleID.auth.signIn();
      if (response.authorization.state !== state) throw new Error("Apple sign-in state validation failed.");
      setBusy(true);
      const apiResponse = await fetch("/api/auth/apple", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: response.authorization.code, nonce,
          firstName: response.user?.name?.firstName,
          lastName: response.user?.name?.lastName,
        }),
      });
      if (!apiResponse.ok) throw new Error(await getApiErrorMessage(apiResponse));
      const result = (await apiResponse.json()) as ApiEnvelope<AuthResponse>;
      setAccessToken(result.data.accessToken);
      setUser(result.data.user);
      setStatus("signed-in");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Apple sign-in failed.");
    } finally { setBusy(false); }
  };

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
    } catch { /* Clear local state even if the network request fails. */ }
    finally {
      setAccessToken(null);
      setUser(null);
      setStatus("signed-out");
      setError("");
      setBusy(false);
    }
  };

  if (status === "loading") {
    return <main className="screen"><div className="loading-card"><span className="spinner" /> Restoring your session…</div></main>;
  }

  if (status === "signed-in" && user) {
    return <DashboardPage user={user} isLoading={busy} onLogout={() => void logout()} />;
  }

  const socialContent = (
    <>
      {GOOGLE_CLIENT_ID && (
        <div className="google-button-wrap">
          <div ref={googleButtonRef} />
          {!googleReady && <div className="google-placeholder">Loading Google sign-in…</div>}
        </div>
      )}
      {FACEBOOK_APP_ID && (
        <button className="facebook-login-button" onClick={loginWithFacebook} disabled={!facebookReady || busy}>
          <span className="facebook-mark">f</span>
          {facebookReady ? "Continue with Facebook" : "Loading Facebook…"}
        </button>
      )}
      {APPLE_CLIENT_ID && APPLE_REDIRECT_URI && (
        <button className="apple-login-button" onClick={() => void loginWithApple()} disabled={!appleReady || busy}>
          <span className="apple-mark" aria-hidden="true">●</span>
          {appleReady ? "Continue with Apple" : "Loading Apple…"}
        </button>
      )}
    </>
  ) : null;

  return (
    <LoginPage
      isLoading={busy}
      error={error}
      onSubmit={loginWithPassword}
      socialContent={socialContent}
    />
  );
}
