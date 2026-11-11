import type { ReactNode } from "react";
import type { LoginCredentials } from "../types/auth.types";
import { Brand } from "../../../shared/components/Brand";
import { LoginForm } from "./LoginForm";

interface LoginPageProps {
  isLoading: boolean;
  error: string;
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  onSignUp: () => void;
  socialContent?: ReactNode;
}

export function LoginPage({ isLoading, error, onSubmit, onSignUp, socialContent }: LoginPageProps) {
  return (
    <main className="screen">
      <section className="login-card" aria-labelledby="login-title">
        <header className="login-header">
          <Brand className="login-brand" />
          <span className="eyebrow">YOUR BUSINESS, IN CONTROL</span>
        </header>

        <div className="login-intro">
          <h1 id="login-title">Welcome back</h1>
          <p className="subtitle">Sign in to your workspace.</p>
        </div>

        <LoginForm isLoading={isLoading} error={error} onSubmit={onSubmit} />

        {socialContent && (
          <>
            <div className="divider"><span>OR CONTINUE WITH</span></div>
            <div className="social-buttons">{socialContent}</div>
          </>
        )}

        <p className="auth-switch">
          New to POS SaaS?{" "}
          <button type="button" onClick={onSignUp}>Create an account</button>
        </p>
        <p className="privacy-note">
          Secure sign-in. Your social account password is never stored.
        </p>
      </section>
      <footer className="footer">POS SaaS <span>·</span> Simple. Secure. Connected.</footer>
    </main>
  );
}
