# POS SaaS Web

Minimal React + Vite frontend for the POS SaaS authentication demo.

## Setup

1. Create a Google OAuth Web client and/or a Meta app with the Facebook Login product.
2. For local development, configure the frontend origins allowed by each provider:
   - Google: `http://localhost:5173` as an authorized JavaScript origin.
   - Meta: `http://localhost:5173` in the app's allowed domains / Facebook Login settings.
3. Copy `.env.example` to `.env` and set the public provider app IDs:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_FACEBOOK_APP_ID`
4. Install dependencies and start the frontend:

```bash
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:3000`.

Google Identity Services returns an ID token; Facebook Login returns a user access token. The API validates each token with its provider, then issues the POS SaaS access token and an HttpOnly refresh-token cookie. Provider secrets stay on the API and are never exposed to the browser.
