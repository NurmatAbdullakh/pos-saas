import type { LoginCredentials } from "../types/auth.types";
import { useLoginForm } from "../hooks/useLoginForm";

interface LoginFormProps {
  isLoading: boolean;
  error: string;
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
}

export function LoginForm({ isLoading, error, onSubmit }: LoginFormProps) {
  const {
    email,
    password,
    showPassword,
    validationError,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    submit,
  } = useLoginForm({ onSubmit });

  const message = validationError || error;

  return (
    <form className="login-form" onSubmit={(event) => void submit(event)} noValidate>
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
            onClick={togglePasswordVisibility}
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
