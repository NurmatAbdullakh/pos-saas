import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../shared/errors.js";

export interface GoogleProfile {
  subject: string;
  email: string;
  name: string;
}

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const googleTokenService = {
  async verify(idToken: string): Promise<GoogleProfile> {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (
        !payload ||
        !payload.sub ||
        !payload.email ||
        payload.email_verified !== true ||
        !payload.iss ||
        !["accounts.google.com", "https://accounts.google.com"].includes(payload.iss)
      ) {
        throw new UnauthorizedError("Invalid Google credentials");
      }

      return {
        subject: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name?.trim() || payload.email.split("@")[0],
      };
    } catch {
      throw new UnauthorizedError("Invalid or expired Google credentials");
    }
  },
};
