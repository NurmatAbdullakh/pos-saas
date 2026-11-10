import type { ReactNode } from "react";
import type { LoginCredentials } from "../types/auth.types";
import { Brand } from "../../../shared/components/Brand";
import { LoginForm } from "./LoginForm";

interface LoginPageProps {
  isLoading: boolean;
  error: string;
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  socialContent?: ReactNode;
}

export function LoginPage({ isLoading, error, onSubmit, socialContent }: LoginPageProps) {
  return (
    <main className="screen">
      <section className="login-card" aria-labelledby="login-title">
        <Brand className="login-brand" />
        <div className="login-icon" aria-hidden="true"><span>↗</span></div>
        <div className="eyebrow">YOUR BUSINESS, IN CONTROL</div>
        <h1 id="login-title">Welcome back</h1>
        <p className="subtitle">Sign in to continue to your POS workspace.</p>

        <LoginForm isLoading={isLoading} error={error} onSubmit={onSubmit} />

        {socialContent && (
          <>
            <div className="divider"><span>OR CONTINUE WITH</span></div>
            <div className="social-buttons">{socialContent}</div>
          </>
        )}

        <div className="divider"><span>SECURE SIGN-IN</span></div>
        <p className="privacy-note">
          Your account is protected. We never store your social account password.
        </p>
      </section>
      <footer className="footer">POS SaaS <span>·</span> Simple. Secure. Connected.</footer>
    </main>
  );
}
