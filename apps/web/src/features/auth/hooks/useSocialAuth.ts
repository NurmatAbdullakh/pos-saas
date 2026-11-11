import { useCallback, useEffect, useRef, useState } from "react";
import { socialProviderConfig } from "../config/auth.config";

interface UseSocialAuthOptions {
  isEnabled: boolean;
  googleRenderTarget: string;
  onGoogleCredential: (idToken: string) => Promise<void>;
  onFacebookCredential: (accessToken: string) => Promise<void>;
  onAppleCredential: (input: {
    code: string;
    nonce: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  onError: (message: string) => void;
}

export function useSocialAuth({
  isEnabled,
  googleRenderTarget,
  onGoogleCredential,
  onFacebookCredential,
  onAppleCredential,
  onError,
}: UseSocialAuthOptions) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const [appleReady, setAppleReady] = useState(false);

  useEffect(() => {
    const clientId = socialProviderConfig.googleClientId;
    if (!isEnabled || !clientId || !googleButtonRef.current) return;

    let cancelled = false;
    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initialize = () => {
      if (cancelled || !window.google?.accounts.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (!credential) {
            onError("Google did not return a credential.");
            return;
          }
          void onGoogleCredential(credential);
        },
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 320,
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts.id) {
      initialize();
    } else if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initialize;
      script.onerror = () => onError("Unable to load Google sign-in.");
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", initialize, { once: true });
      script.addEventListener("error", () => onError("Unable to load Google sign-in."), { once: true });
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", initialize);
    };
  }, [isEnabled, googleRenderTarget, onError, onGoogleCredential]);

  useEffect(() => {
    const appId = socialProviderConfig.facebookAppId;
    if (!appId) return;

    let cancelled = false;
    const scriptId = "facebook-jssdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initialize = () => {
      if (cancelled || !window.FB) return;
      window.FB.init({ appId, version: "v26.0", xfbml: false });
      setFacebookReady(true);
    };

    window.fbAsyncInit = initialize;
    if (window.FB) initialize();
    else if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.onerror = () => onError("Unable to load Facebook sign-in.");
      document.body.appendChild(script);
    } else {
      script.addEventListener("load", initialize, { once: true });
    }

    return () => {
      cancelled = true;
      if (window.fbAsyncInit === initialize) delete window.fbAsyncInit;
      script?.removeEventListener("load", initialize);
    };
  }, [onError]);

  useEffect(() => {
    if (!socialProviderConfig.appleClientId || !socialProviderConfig.appleRedirectUri) return;

    let cancelled = false;
    const scriptId = "apple-signin-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const initialize = () => {
      if (!cancelled && window.AppleID) setAppleReady(true);
    };

    if (window.AppleID) initialize();
    else if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      script.onload = initialize;
      script.onerror = () => onError("Unable to load Apple sign-in.");
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", initialize, { once: true });
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", initialize);
    };
  }, [onError]);

  const signInWithFacebook = useCallback(() => {
    if (!window.FB) return;
    onError("");
    window.FB.login((response) => {
      const token = response.authResponse?.accessToken;
      if (!token) {
        onError("Facebook sign-in was cancelled or permission was not granted.");
        return;
      }
      void onFacebookCredential(token);
    }, { scope: "email,public_profile" });
  }, [onError, onFacebookCredential]);

  const signInWithApple = useCallback(async () => {
    const clientId = socialProviderConfig.appleClientId;
    const redirectUri = socialProviderConfig.appleRedirectUri;
    if (!window.AppleID || !clientId || !redirectUri) return;

    onError("");
    const nonce = crypto.randomUUID().replace(/-/g, "");
    const state = crypto.randomUUID().replace(/-/g, "");

    try {
      window.AppleID.auth.init({
        clientId,
        scope: "name email",
        redirectURI: redirectUri,
        state,
        nonce,
        usePopup: true,
      });
      const response = await window.AppleID.auth.signIn();
      if (response.authorization.state !== state) {
        throw new Error("Apple sign-in state validation failed.");
      }

      await onAppleCredential({
        code: response.authorization.code,
        nonce,
        firstName: response.user?.name?.firstName,
        lastName: response.user?.name?.lastName,
      });
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Apple sign-in failed.");
    }
  }, [onAppleCredential, onError]);

  return {
    googleButtonRef,
    googleReady,
    facebookReady,
    appleReady,
    signInWithFacebook,
    signInWithApple,
    hasSocialProviders: Boolean(
      socialProviderConfig.googleClientId ||
      socialProviderConfig.facebookAppId ||
      (socialProviderConfig.appleClientId && socialProviderConfig.appleRedirectUri)
    ),
  };
}
