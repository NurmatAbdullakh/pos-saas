import { useState, type FormEvent } from "react";
import type { LoginCredentials } from "../types/auth.types";

interface UseLoginFormOptions {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
}

export function useLoginForm({ onSubmit }: UseLoginFormOptions) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
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

  return {
    email,
    password,
    showPassword,
    validationError,
    setEmail,
    setPassword,
    togglePasswordVisibility: () => setShowPassword((visible) => !visible),
    submit,
  };
}
