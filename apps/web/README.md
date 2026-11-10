# POS SaaS Web

Minimal React + Vite frontend for the POS SaaS Google sign-in demo.

## Setup

1. Create a Google OAuth 2.0 Web client in Google Cloud Console.
2. Add `http://localhost:5173` as an authorized JavaScript origin.
3. Copy `.env.example` to `.env` and set `VITE_GOOGLE_CLIENT_ID` to the Web client ID.
4. Install dependencies and start the frontend:

```bash
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:3000`.

The browser receives a Google ID token from Google Identity Services. The API verifies it and issues the POS SaaS access token plus an HttpOnly refresh-token cookie. The frontend does not persist refresh tokens or Google ID tokens.
