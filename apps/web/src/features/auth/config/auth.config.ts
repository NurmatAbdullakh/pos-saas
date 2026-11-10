import type { SocialProviderConfig } from "../types/auth-provider.types";

export const socialProviderConfig: SocialProviderConfig = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID,
  appleClientId: import.meta.env.VITE_APPLE_CLIENT_ID,
  appleRedirectUri: import.meta.env.VITE_APPLE_REDIRECT_URI,
};
