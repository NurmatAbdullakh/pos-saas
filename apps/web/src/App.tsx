import { useCallback, useEffect, useRef, useState } from "react";

type AuthProvider = "google" | "facebook" | "apple" | "password";
interface User { id: string; name: string; email: string; created_at: string; authProvider: AuthProvider }
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

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.message || "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

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
    if (!response.ok) throw new Error(await readError(response));
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
      if (!response.ok) throw new Error(await readError(response));
      const result = (await response.json()) as ApiEnvelope<AuthResponse>;
      setAccessToken(result.data.accessToken);
      setUser(result.data.user);
      setStatus("signed-in");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `${provider} sign-in failed.`);
    } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (credential) => void completeSocialLogin("google", { idToken: credential.credential }),
      });
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline", size: "large", shape: "rectangular", text: "continue_with", width: 320,
      });
      setGoogleReady(true);
    };
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.head.appendChild(script);
    } else if (window.google) initializeGoogle();
    else script.addEventListener("load", initializeGoogle);
    return () => script?.removeEventListener("load", initializeGoogle);
  }, [completeSocialLogin]);

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
      if (!window.AppleID) return;
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID, scope: "name email",
        redirectURI: APPLE_REDIRECT_URI, state: "apple-sdk-init",
        nonce: "apple-sdk-init-nonce", usePopup: true,
      });
      setAppleReady(true);
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
      if (!apiResponse.ok) throw new Error(await readError(apiResponse));
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
    const providerLabel = user.authProvider === "google" ? "Google"
      : user.authProvider === "facebook" ? "Facebook"
      : user.authProvider === "apple" ? "Apple" : "Email / Password";
    const providerMark = user.authProvider === "google" ? "G"
      : user.authProvider === "facebook" ? "f"
      : user.authProvider === "apple" ? "A" : "@";
    return (
      <main className="dashboard-screen">
        <header className="topbar">
          <a className="brand" href="/"><span className="brand-mark">P</span> POS SaaS</a>
          <button className="logout-button" onClick={() => void logout()} disabled={busy}>
            {busy ? "Signing out…" : "Log out"}
          </button>
        </header>
        <section className="dashboard-content">
          <div className="eyebrow">WORKSPACE OVERVIEW</div>
          <h1>Welcome back, {user.name.split(" ")[0]}.</h1>
          <p className="subtitle">You’re signed in. Your workspace is ready.</p>
          <article className="profile-card">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="profile-main">
              <span className="profile-label">SIGNED-IN ACCOUNT</span>
              <h2>{user.name}</h2><p>{user.email}</p>
            </div>
            <span className="status-dot" aria-label="Active session" />
          </article>
          <article className="session-card">
            <div>
              <span className="profile-label">AUTHENTICATION METHOD</span>
              <div className="provider-line">
                <span className={`provider-icon provider-${user.authProvider}`}>{providerMark}</span>
                <strong>Logged in via: {providerLabel}</strong>
              </div>
            </div>
            <span className="session-badge">Active session</span>
          </article>
        </section>
        <footer className="footer">POS SaaS <span>·</span> Secure workspace</footer>
      </main>
    );
  }

  return (
    <main className="screen">
      <section className="login-card">
        <a className="brand login-brand" href="/"><span className="brand-mark">P</span> POS SaaS</a>
        <div className="login-icon"><span>↗</span></div>
        <div className="eyebrow">YOUR BUSINESS, IN CONTROL</div>
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to continue to your POS workspace.</p>
        <div className="social-buttons">
          {GOOGLE_CLIENT_ID && (
            <div className="google-button-wrap" ref={googleButtonRef}>
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
          {!GOOGLE_CLIENT_ID && !FACEBOOK_APP_ID && !(APPLE_CLIENT_ID && APPLE_REDIRECT_URI) && (
            <div className="google-placeholder">Configure a sign-in provider in apps/web/.env</div>
          )}
        </div>
        {busy && <p className="helper-text">Verifying your account…</p>}
        {error && <div className="error-message" role="alert">{error}</div>}
        <div className="divider"><span>SECURE SIGN-IN</span></div>
        <p className="privacy-note">Your account is protected. We never store your social account password.</p>
      </section>
      <footer className="footer">POS SaaS <span>·</span> Simple. Secure. Connected.</footer>
    </main>
  );
}
