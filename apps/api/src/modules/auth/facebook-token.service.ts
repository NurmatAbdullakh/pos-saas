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

interface FacebookGraphErrorResponse {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
  };
}

const graphBaseUrl = `https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}`;

async function readGraphError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as FacebookGraphErrorResponse;
    const error = body.error;
    if (!error) return `HTTP ${response.status}`;

    return [
      `HTTP ${response.status}`,
      error.type ? `type=${error.type}` : null,
      error.code !== undefined ? `code=${error.code}` : null,
      error.error_subcode !== undefined ? `subcode=${error.error_subcode}` : null,
      error.message ? `message=${error.message}` : null,
    ].filter(Boolean).join(" ");
  } catch {
    return `HTTP ${response.status} (non-JSON response)`;
  }
}

export const facebookTokenService = {
  async verify(accessToken: string): Promise<FacebookProfile> {
    if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) {
      console.error("[Facebook Auth] Missing server configuration:", {
        appIdConfigured: Boolean(env.FACEBOOK_APP_ID),
        appSecretConfigured: Boolean(env.FACEBOOK_APP_SECRET),
      });
      throw new UnauthorizedError("Invalid, expired, or unavailable Facebook credentials");
    }

    let stage = "debug_token";

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
        throw new Error(await readGraphError(debugResponse));
      }

      const debugResult = (await debugResponse.json()) as FacebookDebugTokenResponse;
      const token = debugResult.data;
      const now = Math.floor(Date.now() / 1000);

      const invalidTokenReasons = {
        hasData: Boolean(token),
        isValid: token?.is_valid === true,
        appMatches: token?.app_id === env.FACEBOOK_APP_ID,
        isUserToken: token?.type === "USER",
        hasUserId: Boolean(token?.user_id),
        expired:
          token?.expires_at !== undefined &&
          token.expires_at !== 0 &&
          token.expires_at <= now,
        dataAccessExpired:
          token?.data_access_expires_at !== undefined &&
          token.data_access_expires_at !== 0 &&
          token.data_access_expires_at <= now,
      };

      if (
        !token ||
        !invalidTokenReasons.isValid ||
        !invalidTokenReasons.appMatches ||
        !invalidTokenReasons.isUserToken ||
        !invalidTokenReasons.hasUserId ||
        invalidTokenReasons.expired ||
        invalidTokenReasons.dataAccessExpired
      ) {
        console.error("[Facebook Auth] Facebook access token rejected:", invalidTokenReasons);
        throw new Error("Facebook access token failed validity, app, type, or expiry checks");
      }

      stage = "profile";
      const profileUrl = new URL(`${graphBaseUrl}/me`);
      profileUrl.search = new URLSearchParams({
        fields: "id,name,email",
        access_token: accessToken,
      }).toString();

      const profileResponse = await fetch(profileUrl, {
        signal: AbortSignal.timeout(8000),
      });
      if (!profileResponse.ok) {
        throw new Error(await readGraphError(profileResponse));
      }

      const profile = (await profileResponse.json()) as FacebookUserResponse;

      if (
        profile.error ||
        !profile.id ||
        profile.id !== token.user_id ||
        !profile.email
      ) {
        console.error("[Facebook Auth] Facebook profile is incomplete or inconsistent:", {
          hasError: Boolean(profile.error),
          hasId: Boolean(profile.id),
          subjectMatches: profile.id === token.user_id,
          hasEmail: Boolean(profile.email),
        });
        throw new Error("Facebook profile did not include a matching user ID and email");
      }

      return {
        subject: profile.id,
        email: profile.email.trim().toLowerCase(),
        name: profile.name?.trim() || profile.email.split("@")[0],
      };
    } catch (error) {
      // Never log access tokens, app secrets, or full Graph API URLs.
      console.error(
        `[Facebook Auth] ${stage} verification failed:`,
        error instanceof Error ? error.message : "Unknown error",
      );
      throw new UnauthorizedError("Invalid, expired, or unavailable Facebook credentials");
    }
  },
};
