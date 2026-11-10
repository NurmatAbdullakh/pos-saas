import { Navigate, Route, Routes } from "react-router-dom";
import { socialProviderConfig } from "./features/auth/config/auth.config";
import { LoginPage } from "./features/auth/components/LoginPage";
import { useAuth } from "./features/auth/hooks/useAuth";
import { useSocialAuth } from "./features/auth/hooks/useSocialAuth";
import { WorkspaceLayout } from "./features/workspace/components/WorkspaceLayout";
import { OverviewPage } from "./features/workspace/components/OverviewPage";
import { BusinessesPage } from "./features/businesses/components/BusinessesPage";
import { BusinessWorkspacePage } from "./features/businesses/components/BusinessWorkspacePage";
import { BusinessWorkspaceHome } from "./features/businesses/components/BusinessWorkspaceHome";
import { StoresPage } from "./features/stores/components/StoresPage";
import { MembershipsPage } from "./features/memberships/components/MembershipsPage";

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
        <div className="loading-card"><span className="spinner" /> Restoring your session…</div>
      </main>
    );
  }

  if (auth.status === "signed-out" || !auth.user || !auth.accessToken) {
    const socialContent = social.hasSocialProviders ? (
      <>
        {Boolean(socialProviderConfig.googleClientId) && (
          <div className="google-button-wrap">
            <div ref={social.googleButtonRef} />
            {!social.googleReady && <div className="google-placeholder">Loading Google sign-in…</div>}
          </div>
        )}
        {Boolean(socialProviderConfig.facebookAppId) && (
          <button className="facebook-login-button" onClick={social.signInWithFacebook} disabled={!social.facebookReady || auth.isLoading}>
            <span className="facebook-mark">f</span>
            {social.facebookReady ? "Continue with Facebook" : "Loading Facebook…"}
          </button>
        )}
        {Boolean(socialProviderConfig.appleClientId && socialProviderConfig.appleRedirectUri) && (
          <button className="apple-login-button" onClick={() => void social.signInWithApple()} disabled={!social.appleReady || auth.isLoading}>
            <span className="apple-mark" aria-hidden="true">●</span>
            {social.appleReady ? "Continue with Apple" : "Loading Apple…"}
          </button>
        )}
      </>
    ) : null;

    return <LoginPage isLoading={auth.isLoading} error={auth.error} onSubmit={auth.signInWithPassword} socialContent={socialContent} />;
  }

  return (
    <Routes>
      <Route element={<WorkspaceLayout accessToken={auth.accessToken} user={auth.user} isSigningOut={auth.isLoading} onLogout={() => void auth.signOut()} />}>
        <Route index element={<OverviewPage />} />
        <Route path="businesses" element={<BusinessesPage accessToken={auth.accessToken} userId={auth.user.id} />} />
        <Route path="businesses/:businessId" element={<BusinessWorkspacePage accessToken={auth.accessToken} />}>
          <Route index element={<BusinessWorkspaceHome />} />
          <Route path="stores" element={<StoresPage accessToken={auth.accessToken} currentUserId={auth.user.id} />} />
          <Route path="members" element={<MembershipsPage accessToken={auth.accessToken} currentUserId={auth.user.id} />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
