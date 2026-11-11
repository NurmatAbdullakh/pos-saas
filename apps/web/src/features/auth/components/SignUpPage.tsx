import { useState, type FormEvent } from "react";
import type { RegisterCredentials } from "../types/auth.types";
import { Brand } from "../../../shared/components/Brand";

interface SignUpPageProps {
  isLoading: boolean;
  error: string;
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
  onSignIn: () => void;
}

export function SignUpPage({ isLoading, error, onSubmit, onSignIn }: SignUpPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError("");

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }
    if (password.length < 12) {
      setValidationError("Password must contain at least 12 characters.");
      return;
    }

    await onSubmit({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <main className="screen">
      <section className="login-card signup-card" aria-labelledby="signup-title">
        <header className="login-header">
          <Brand className="login-brand" />
          <span className="eyebrow">YOUR BUSINESS, IN CONTROL</span>
        </header>

        <div className="login-intro">
          <h1 id="signup-title">Create your account</h1>
          <p className="subtitle">Start managing your business with POS SaaS.</p>
        </div>

        <form className="login-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="form-field">
            <label htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isLoading}
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 12 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              minLength={12}
              maxLength={128}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="signup-confirm-password">Confirm password</label>
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isLoading}
              minLength={12}
              maxLength={128}
              required
            />
          </div>

          {(validationError || error) && (
            <p className="error-message" role="alert">{validationError || error}</p>
          )}

          <button className="login-submit-button" type="submit" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" onClick={onSignIn}>Sign in</button>
        </p>
        <p className="privacy-note">By creating an account, you agree to use POS SaaS responsibly.</p>
      </section>
      <footer className="footer">POS SaaS <span>·</span> Simple. Secure. Connected.</footer>
    </main>
  );
}
