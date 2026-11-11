import { useState, type ReactNode } from "react";
import type { AuthResponse, LoginCredentials } from "../types/auth.types";
import { Brand } from "../../../shared/components/Brand";
import { LoginForm } from "./LoginForm";
import { PhoneAuthForm } from "./PhoneAuthForm";

interface LoginPageProps {
  isLoading: boolean;
  error: string;
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  onPhoneAuthenticated: (response: AuthResponse) => void;
  socialContent?: ReactNode;
}

type LoginMethod = "email" | "phone";

export function LoginPage({ isLoading, error, onSubmit, onPhoneAuthenticated, socialContent }: LoginPageProps) {
  const [activeMethod, setActiveMethod] = useState<LoginMethod>("email");

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

        <div className="login-method-tabs" role="tablist" aria-label="Sign-in method">
          <button
            id="email-login-tab"
            className={`login-method-tab${activeMethod === "email" ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeMethod === "email"}
            aria-controls="email-login-panel"
            onClick={() => setActiveMethod("email")}
          >
            Email
          </button>
          <button
            id="phone-login-tab"
            className={`login-method-tab${activeMethod === "phone" ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeMethod === "phone"}
            aria-controls="phone-login-panel"
            onClick={() => setActiveMethod("phone")}
          >
            Phone number
          </button>
        </div>

        {activeMethod === "email" ? (
          <div id="email-login-panel" role="tabpanel" aria-labelledby="email-login-tab">
            <LoginForm isLoading={isLoading} error={error} onSubmit={onSubmit} />
          </div>
        ) : (
          <div id="phone-login-panel" role="tabpanel" aria-labelledby="phone-login-tab">
            <PhoneAuthForm onAuthenticated={onPhoneAuthenticated} />
          </div>
        )}

        {socialContent && (
          <>
            <div className="divider"><span>OR CONTINUE WITH</span></div>
            <div className="social-buttons">{socialContent}</div>
          </>
        )}
        <p className="privacy-note">Secure sign-in. Your social account password is never stored.</p>
      </section>
      <footer className="footer">POS SaaS <span>·</span> Simple. Secure. Connected.</footer>
    </main>
  );
}
