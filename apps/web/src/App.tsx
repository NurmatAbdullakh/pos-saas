import { socialProviderConfig } from "./features/auth/config/auth.config";
import { LoginPage } from "./features/auth/components/LoginPage";
import { DashboardPage } from "./features/dashboard/components/DashboardPage";
import { useAuth } from "./features/auth/hooks/useAuth";
import { useSocialAuth } from "./features/auth/hooks/useSocialAuth";

export default function App() {
  const auth = useAuth();
  const social = useSocialAuth({
    isEnabled: auth.status === "signed-out",
    onGoogleCredential: auth.signInWithGoogle,
    onFacebookCredential: auth.signInWithFacebook,
    onAppleCredential: auth.signInWithApple,
    onError: auth.setAuthError,
  });

  if (auth.status === "loading") {
    return (
      <main className="screen">
        <div className="loading-card">
          <span className="spinner" />
          Restoring your session…
        </div>
      </main>
    );
  }

  if (auth.status === "signed-in" && auth.user) {
    return (
      <DashboardPage
        user={auth.user}
        isLoading={auth.isLoading}
        onLogout={() => void auth.signOut()}
      />
    );
  }

  const socialContent = social.hasSocialProviders ? (
    <>
      {Boolean(socialProviderConfig.googleClientId) && (
        <div className="google-button-wrap">
          <div ref={social.googleButtonRef} />
          {!social.googleReady && (
            <div className="google-placeholder">Loading Google sign-in…</div>
          )}
        </div>
      )}

      {Boolean(socialProviderConfig.facebookAppId) && (
        <button
          className="facebook-login-button"
          onClick={social.signInWithFacebook}
          disabled={!social.facebookReady || auth.isLoading}
        >
          <span className="facebook-mark">f</span>
          {social.facebookReady ? "Continue with Facebook" : "Loading Facebook…"}
        </button>
      )}

      {Boolean(socialProviderConfig.appleClientId && socialProviderConfig.appleRedirectUri) && (
        <button
          className="apple-login-button"
          onClick={() => void social.signInWithApple()}
          disabled={!social.appleReady || auth.isLoading}
        >
          <span className="apple-mark" aria-hidden="true">●</span>
          {social.appleReady ? "Continue with Apple" : "Loading Apple…"}
        </button>
      )}
    </>
  ) : null;

  return (
    <LoginPage
      isLoading={auth.isLoading}
      error={auth.error}
      onSubmit={auth.signInWithPassword}
      socialContent={socialContent}
    />
  );
}
