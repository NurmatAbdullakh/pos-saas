import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env.js";

interface AccessTokenPayload extends JwtPayload {
  userId: string;
}

export const tokenService = {
  sign(userId: string): string {
    return jwt.sign(
      { userId },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  },

  verify(token: string): AccessTokenPayload {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof payload === "string" ||
      typeof payload.userId !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    return payload as AccessTokenPayload;
  },
};