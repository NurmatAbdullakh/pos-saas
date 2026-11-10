import { useCallback, useEffect, useRef, useState } from "react";

type AuthProvider = "google" | "password";

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  authProvider: AuthProvider;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentity {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      theme: "outline";
      size: "large";
      shape: "rectangular";
      text: "continue_with";
      width: number;
    },
  ): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentity;
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const restoreStarted = useRef(false);

  const loadCurrentUser = useCallback(async (token: string) => {
    const response = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const result = (await response.json()) as ApiEnvelope<User>;
    setUser(result.data);
    setAccessToken(token);
    setStatus("signed-in");
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        setStatus("signed-out");
        return;
      }

      const result = (await response.json()) as {
        accessToken: string;
      };

      await loadCurrentUser(result.accessToken);
    } catch {
      setStatus("signed-out");
    }
  }, [loadCurrentUser]);

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;
    void restoreSession();
  }, [restoreSession]);

  const handleGoogleCredential = useCallback(async (response: GoogleCredentialResponse) => {
    setBusy(true);
    setError("");

    try {
      const loginResponse = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken: response.credential }),
      });

      if (!loginResponse.ok) {
        throw new Error(await readError(loginResponse));
      }

      const result = (await loginResponse.json()) as ApiEnvelope<AuthResponse>;
      setAccessToken(result.data.accessToken);
      setUser(result.data.user);
      setStatus("signed-in");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID.");
      return;
    }

    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (credential) => void handleGoogleCredential(credential),
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 320,
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
    } else if (window.google) {
      initializeGoogle();
    } else {
      script.addEventListener("load", initializeGoogle);
    }

    return () => {
      script?.removeEventListener("load", initializeGoogle);
    };
  }, [handleGoogleCredential]);

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
    } catch {
      // Clear the local session even if the network request fails.
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus("signed-out");
      setError("");
      setBusy(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="screen">
        <div className="loading-card"><span className="spinner" /> Restoring your session…</div>
      </main>
    );
  }

  if (status === "signed-in" && user) {
    return (
      <main className="dashboard-screen">
        <header className="topbar">
          <a className="brand" href="/"> <span className="brand-mark">P</span> POS SaaS</a>
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
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
            <span className="status-dot" aria-label="Active session" />
          </article>

          <article className="session-card">
            <div>
              <span className="profile-label">AUTHENTICATION METHOD</span>
              <div className="provider-line">
                <span className="google-g">G</span>
                <strong>Logged in via: {user.authProvider === "google" ? "Google" : "Email / Password"}</strong>
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
        <a className="brand login-brand" href="/">
          <span className="brand-mark">P</span> POS SaaS
        </a>
        <div className="login-icon"><span>↗</span></div>
        <div className="eyebrow">YOUR BUSINESS, IN CONTROL</div>
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to continue to your POS workspace.</p>

        <div className="google-button-wrap" ref={googleButtonRef}>
          {!googleReady && <div className="google-placeholder">Loading Google sign-in…</div>}
        </div>
        {busy && <p className="helper-text">Verifying your Google account…</p>}
        {error && <div className="error-message" role="alert">{error}</div>}
        <div className="divider"><span>SECURE SIGN-IN</span></div>
        <p className="privacy-note">Your account is protected. We never store your Google password.</p>
      </section>
      <footer className="footer">POS SaaS <span>·</span> Simple. Secure. Connected.</footer>
    </main>
  );
}
