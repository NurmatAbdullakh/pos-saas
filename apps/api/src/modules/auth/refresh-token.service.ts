import { createHash, randomBytes } from "node:crypto";

export const refreshTokenService = {
  generate(): string {
    return randomBytes(32).toString("base64url");
  },

  hash(token: string): string {
    return createHash("sha256")
      .update(token)
      .digest("hex");
  },
};