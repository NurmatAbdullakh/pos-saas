import jwt from "jsonwebtoken";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../shared/errors.js";

export interface AppleProfile {
  subject: string;
  email: string;
  name: string;
}

interface AppleTokenResponse {
  id_token?: string;
  error?: string;
}

const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

function createClientSecret(): string {
  const now = Math.floor(Date.now() / 1000);
  const privateKey = env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n");

  return jwt.sign(
    {
      iss: env.APPLE_TEAM_ID,
      iat: now,
      exp: now + 60 * 60 * 24 * 30,
      aud: "https://appleid.apple.com",
      sub: env.APPLE_CLIENT_ID,
    },
    privateKey,
    {
      algorithm: "ES256",
      keyid: env.APPLE_KEY_ID,
    },
  );
}

export const appleTokenService = {
  async exchangeAndVerify(input: {
    code: string;
    nonce: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AppleProfile> {
    if (
      !env.APPLE_TEAM_ID || !env.APPLE_CLIENT_ID ||
      !env.APPLE_KEY_ID || !env.APPLE_PRIVATE_KEY
    ) {
      throw new UnauthorizedError("Apple sign-in is not configured");
    }

    try {
      const form = new URLSearchParams({
        client_id: env.APPLE_CLIENT_ID,
        client_secret: createClientSecret(),
        code: input.code,
        grant_type: "authorization_code",
        redirect_uri: env.APPLE_REDIRECT_URI,
      });

      const response = await fetch("https://appleid.apple.com/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Apple authorization code exchange failed");

      const tokenResponse = (await response.json()) as AppleTokenResponse;
      if (!tokenResponse.id_token) throw new Error("Apple did not return an identity token");

      const { payload } = await jwtVerify(tokenResponse.id_token, appleJwks, {
        issuer: "https://appleid.apple.com",
        audience: env.APPLE_CLIENT_ID,
        algorithms: ["ES256"],
        nonce: input.nonce,
      });

      if (
        typeof payload.sub !== "string" ||
        typeof payload.email !== "string" ||
        (payload.email_verified !== true && payload.email_verified !== "true")
      ) {
        throw new Error("Apple identity token is missing verified identity claims");
      }

      const email = payload.email.trim().toLowerCase();
      const suppliedName = [input.firstName, input.lastName]
        .filter((part): part is string => Boolean(part?.trim()))
        .map((part) => part.trim().replace(/[<>]/g, ""))
        .join(" ");
      const name = suppliedName || email.split("@")[0] || "Apple User";

      return { subject: payload.sub, email, name };
    } catch {
      throw new UnauthorizedError("Invalid, expired, or unavailable Apple credentials");
    }
  },
};
