import { useState, type FormEvent } from "react";
import type { LoginCredentials } from "../types/auth.types";

interface LoginFormProps {
  isLoading: boolean;
  error: string;
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
}

export function LoginForm({ isLoading, error, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setValidationError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setValidationError("Enter a valid email address.");
      return;
    }
    if (password.length < 12) {
      setValidationError("Password must contain at least 12 characters.");
      return;
    }

    await onSubmit({ email: normalizedEmail, password });
  };

  const message = validationError || error;

  return (
    <form className="login-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className="form-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="login-password">Password</label>
        <div className="password-input-wrap">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            required
            minLength={12}
          />
          <button
            className="password-visibility-button"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {message && <p className="error-message" role="alert">{message}</p>}

      <button className="login-submit-button" type="submit" disabled={isLoading}>
        {isLoading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
