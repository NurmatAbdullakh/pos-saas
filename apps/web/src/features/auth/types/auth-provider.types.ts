export interface GoogleCredentialResponse {
  credential: string;
}

export interface GoogleIdentity {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      theme: "outline";
      size: "large";
      shape: "rectangular";
      text: "continue_with";
      width: number;
    },
  ): void;
}

export interface FacebookLoginResponse {
  authResponse?: {
    accessToken: string;
    userID: string;
  };
}

export interface FacebookSdk {
  init(options: { appId: string; version: string; xfbml: boolean }): void;
  login(
    callback: (response: FacebookLoginResponse) => void,
    options: { scope: string },
  ): void;
}

export interface AppleAuthorizationResponse {
  authorization: { code: string; state: string; id_token?: string };
  user?: { name?: { firstName?: string; lastName?: string }; email?: string };
}

export interface AppleAuthSdk {
  init(options: {
    clientId: string;
    scope: string;
    redirectURI: string;
    state: string;
    nonce: string;
    usePopup: boolean;
  }): void;
  signIn(): Promise<AppleAuthorizationResponse>;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
    FB?: FacebookSdk;
    AppleID?: { auth: AppleAuthSdk };
    fbAsyncInit?: () => void;
  }
}

