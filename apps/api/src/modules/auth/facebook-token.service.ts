import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../shared/errors.js";

export interface FacebookProfile {
  subject: string;
  email: string;
  name: string;
}

interface FacebookDebugTokenResponse {
  data?: {
    app_id?: string;
    type?: string;
    application?: string;
    is_valid?: boolean;
    user_id?: string;
    expires_at?: number;
    data_access_expires_at?: number;
  };
}

interface FacebookUserResponse {
  id?: string;
  name?: string;
  email?: string;
  error?: { message?: string; code?: number };
}

const graphBaseUrl = `https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}`;

export const facebookTokenService = {
  async verify(accessToken: string): Promise<FacebookProfile> {
    if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) {
      throw new UnauthorizedError("Facebook sign-in is not configured");
    }

    try {
      const appAccessToken = `${env.FACEBOOK_APP_ID}|${env.FACEBOOK_APP_SECRET}`;
      const debugUrl = new URL(`${graphBaseUrl}/debug_token`);
      debugUrl.search = new URLSearchParams({
        input_token: accessToken,
        access_token: appAccessToken,
      }).toString();

      const debugResponse = await fetch(debugUrl, {
        signal: AbortSignal.timeout(8000),
      });
      if (!debugResponse.ok) {
        throw new Error("Facebook token inspection failed");
      }

      const debugResult = (await debugResponse.json()) as FacebookDebugTokenResponse;
      const token = debugResult.data;
      const now = Math.floor(Date.now() / 1000);

      if (
        !token ||
        token.is_valid !== true ||
        token.app_id !== env.FACEBOOK_APP_ID ||
        token.type !== "USER" ||
        !token.user_id ||
        (token.expires_at !== undefined && token.expires_at !== 0 && token.expires_at <= now) ||
        (token.data_access_expires_at !== undefined &&
          token.data_access_expires_at !== 0 &&
          token.data_access_expires_at <= now)
      ) {
        throw new Error("Facebook access token is invalid for this app");
      }

      const profileUrl = new URL(`${graphBaseUrl}/me`);
      profileUrl.search = new URLSearchParams({
        fields: "id,name,email",
        access_token: accessToken,
      }).toString();

      const profileResponse = await fetch(profileUrl, {
        signal: AbortSignal.timeout(8000),
      });
      if (!profileResponse.ok) {
        throw new Error("Facebook profile request failed");
      }

      const profile = (await profileResponse.json()) as FacebookUserResponse;

      if (
        profile.error ||
        !profile.id ||
        profile.id !== token.user_id ||
        !profile.email
      ) {
        throw new Error("Facebook did not return a verified account email");
      }

      return {
        subject: profile.id,
        email: profile.email.trim().toLowerCase(),
        name: profile.name?.trim() || profile.email.split("@")[0],
      };
    } catch {
      throw new UnauthorizedError("Invalid, expired, or unavailable Facebook credentials");
    }
  },
};
