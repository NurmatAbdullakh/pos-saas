import { Brand } from "../../../shared/components/Brand";
import type { AuthUser } from "../../auth/types/auth.types";

interface DashboardPageProps {
  user: AuthUser;
  isLoading: boolean;
  onLogout: () => void;
}

const providerLabels: Record<AuthUser["authProvider"], string> = {
  google: "Google",
  facebook: "Facebook",
  apple: "Apple",
  password: "Email / Password",
};

const providerMarks: Record<AuthUser["authProvider"], string> = {
  google: "G",
  facebook: "f",
  apple: "A",
  password: "@",
};

export function DashboardPage({ user, isLoading, onLogout }: DashboardPageProps) {
  return (
    <main className="dashboard-screen">
      <header className="topbar">
        <Brand />
        <button className="logout-button" onClick={onLogout} disabled={isLoading}>
          {isLoading ? "Signing out…" : "Log out"}
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
              <span className={`provider-icon provider-${user.authProvider}`}>
                {providerMarks[user.authProvider]}
              </span>
              <strong>Logged in via: {providerLabels[user.authProvider]}</strong>
            </div>
          </div>
          <span className="session-badge">Active session</span>
        </article>
      </section>

      <footer className="footer">POS SaaS <span>·</span> Secure workspace</footer>
    </main>
  );
}
