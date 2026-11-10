# POS SaaS Web

Minimal React + Vite frontend for the POS SaaS authentication demo.

## Setup

1. Configure the provider application(s):
   - Google: authorized JavaScript origin `http://localhost:5173`.
   - Meta: add `http://localhost:5173` to the app's allowed domains / Facebook Login settings.
   - Apple: create a Services ID, associate it with a Sign in with Apple-enabled primary App ID, and register the exact HTTPS domain and return URL. Apple does not accept localhost or plain HTTP as a return URL; use an HTTPS development tunnel or deployed HTTPS domain.
2. Copy `.env.example` to `.env` and set:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_FACEBOOK_APP_ID`
   - `VITE_APPLE_CLIENT_ID` (Apple Services ID)
   - `VITE_APPLE_REDIRECT_URI` (must exactly match the return URL registered with Apple and the API value)
3. Install dependencies and start the frontend:

```bash
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:3000`.

Google Identity Services returns an ID token; Facebook Login returns a user access token; Sign in with Apple returns a one-time authorization code. The API validates each provider credential, then issues the POS SaaS access token and an HttpOnly refresh-token cookie. Provider secrets stay on the API and are never exposed to the browser.
