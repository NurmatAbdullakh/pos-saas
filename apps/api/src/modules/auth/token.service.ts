import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env.js";

export type AuthProvider = "password" | "google" | "facebook" | "apple";

interface AccessTokenPayload extends JwtPayload {
  userId: string;
  authProvider: AuthProvider;
}

export const tokenService = {
  sign(userId: string, authProvider: AuthProvider = "password"): string {
    return jwt.sign({ userId, authProvider }, env.JWT_SECRET, { expiresIn: "1h" });
  },

  verify(token: string): AccessTokenPayload {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === "string" || typeof payload.userId !== "string") {
      throw new Error("Invalid token payload");
    }

    const authProvider: AuthProvider =
      payload.authProvider === "google" ||
      payload.authProvider === "facebook" ||
      payload.authProvider === "apple"
        ? payload.authProvider
        : "password";

    return { ...payload, authProvider } as AccessTokenPayload;
  },
};
