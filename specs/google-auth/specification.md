# Google Authentication — Specification

## 1. Purpose

Add Google sign-in to the existing POS SaaS application without Firebase. Google is the first external identity provider. The backend remains responsible for issuing and managing the application's own access and refresh tokens.

This document is the source of truth for implementation. Do not begin implementation until the specification and acceptance criteria have been reviewed and approved.

## 2. Existing application context

- API: Node.js, Express, TypeScript, PostgreSQL.
- Existing authentication: email/password registration and login, access JWT, refresh-token rotation, logout, and authenticated `me` endpoint.
- Existing backend layering: Controller → Service → Repository, with dependency injection.
- Frontend: not currently present in the inspected repository tree. Add a React + TypeScript + Vite application under `apps/web` unless repository inspection during implementation reveals an existing frontend in the branch.
- Existing Products CRUD must remain operational and unchanged in behavior.

## 3. Goals

1. Allow a user to sign in using a Google account.
2. Verify Google identity on the API server, not merely trust client-supplied profile data.
3. Create or retrieve a local POS SaaS user for a verified Google identity.
4. Issue the application's own access JWT and refresh-token session.
5. Preserve the authentication provider across page reloads and token refresh.
6. Provide a minimal frontend login screen and authenticated dashboard.
7. Show the current user's name/email and the provider used to authenticate (Google or Email/Password).
8. Allow the user to log out and invalidate the refresh session.

## 4. Out of scope

- Firebase or Firebase Authentication.
- Facebook, Apple, GitHub, or other identity providers.
- RBAC, roles, permissions, business membership flows, and authorization redesign.
- Automatic linking of a Google identity to an existing password account based only on matching email.
- Password reset, MFA, account deletion, and profile editing.
- Changes to Products CRUD or unrelated business modules.

## 5. User stories

- As a visitor, I can choose “Continue with Google” on the login page.
- As a visitor, I receive a clear error if Google authentication fails or the credential is invalid.
- As a returning user, signing in with the same Google account resolves to the same local POS SaaS account.
- As an authenticated user, I can see my name, email, and “Logged in via: Google”.
- As an authenticated user, refreshing the page restores my session using the existing refresh-token mechanism.
- As an authenticated user, I can log out; after logout, protected dashboard content is no longer accessible.
- As an existing email/password user, I can continue using the current authentication flow.

## 6. Authentication flow

### 6.1 Browser

1. The login page loads Google Identity Services (GIS) using the configured Google OAuth Web Client ID.
2. The user completes Google's sign-in interaction.
3. GIS returns an ID token credential to the frontend.
4. The frontend sends that ID token to the API's Google sign-in endpoint over HTTPS.
5. The frontend must not treat the Google ID token as the POS SaaS API access token and must not store it as the application's session.

### 6.2 API

1. Validate the request body with Zod.
2. Verify the Google ID token server-side using Google's supported verification library (for example, `google-auth-library` and `OAuth2Client.verifyIdToken`).
3. Verify the token audience against the configured `GOOGLE_CLIENT_ID`; validate signature, expiry, issuer, and that the email is verified.
4. Use Google's stable `sub` claim as the provider user ID. Do not use email as the external identity key.
5. Find the local identity by provider + provider user ID.
6. If the identity exists, load its linked local user.
7. If it does not exist, create a local user and Google identity in one database transaction.
8. Issue the application's access JWT and create its refresh-token session using the existing auth/session services where practical.
9. Set the refresh token in the existing HttpOnly cookie using the established cookie settings. Return the application access token and safe user profile data.
10. Never return or persist the Google ID token as the application's refresh token.

### 6.3 Account matching and linking

- A Google identity is matched by `(provider, provider_user_id)`, not by email.
- If a Google sign-in email matches an existing local account that has no Google identity, do not silently link the accounts.
- Return a safe, actionable conflict response instructing the user to sign in using the existing method first. An explicit account-linking flow may be designed later, but is not part of this feature.
- Enforce database uniqueness so concurrent first sign-ins cannot create duplicate identities or duplicate local accounts for the same Google subject.
- If Google returns no verified email, reject sign-in.

## 7. Data model and migrations

### 7.1 User password compatibility

Google-only users do not have a local password. Add a migration making `users.password_hash` nullable. Update TypeScript types and password-login logic to handle a null password hash safely:
- A user without a password hash cannot authenticate through email/password.
- The login endpoint must return the same generic invalid-credentials response used for a wrong password, avoiding account enumeration.

### 7.2 User identities

Add a `user_identities` table with at least:
- `id`: UUID primary key.
- `user_id`: UUID foreign key to `users(id)`, with appropriate deletion behavior.
- `provider`: text/varchar; initially only `google`.
- `provider_user_id`: Google's stable `sub` value.
- `provider_email`: verified email observed at sign-in (for audit/display context; local user email remains the application's user profile).
- `created_at` and `updated_at` timestamps, following existing project conventions.

Constraints:
- Unique `(provider, provider_user_id)`.
- Unique `(user_id, provider)` for the current one-account-per-provider policy.
- Add an index for `user_id` if not already covered by constraints.

### 7.3 Authentication provider on refresh sessions

Persist the login provider on the refresh-token session (for example, add a `provider` column to `refresh_tokens`, defaulting existing rows to `password`). Refresh-token rotation must preserve this value. The API's authenticated-user response must be able to return the provider for the active session after reload/refresh.

The access JWT may include a validated `authProvider` claim if needed, but the server must not trust a client-supplied provider value. Follow the existing JWT validation conventions.

### 7.4 Migration safety

- Use new forward migrations; do not edit already-applied migrations.
- Existing password users and refresh sessions must continue to work.
- Migrations must be reversible where supported by the project's migration conventions.

## 8. API contract

Use the existing auth module and naming conventions. Proposed endpoint:

### `POST /api/auth/google`

Request:
```json
{
  "idToken": "<Google ID token>"
}
```

Success response (shape may be aligned with existing login response):
```json
{
  "accessToken": "<POS SaaS access token>",
  "user": {
    "id": "<uuid>",
    "name": "<name>",
    "email": "<verified email>",
    "authProvider": "google"
  }
}
```

The endpoint also sets the existing HttpOnly refresh-token cookie. Do not include the refresh token in JSON.

Error behavior:
- `400`: malformed request.
- `401`: invalid, expired, wrong-audience, wrong-issuer, or unverified-email Google credential.
- `409`: email belongs to an existing local account that is not linked to this Google identity.
- `500`: unexpected server failure, handled by the existing centralized error middleware without leaking secrets.

### Authenticated user endpoint

Extend the existing authenticated `me` response to include `authProvider` for the current session. Preserve existing fields and response compatibility. If the current session cannot provide a provider for a legacy edge case, use a documented safe fallback consistent with existing sessions.

### Existing endpoints

- Email/password register and login remain supported.
- Refresh rotates the refresh token and preserves its provider.
- Logout revokes the current refresh session and clears the cookie.
- Existing auth middleware continues to validate only the application's access JWT.

## 9. Frontend requirements

Create a minimal React + TypeScript + Vite frontend under `apps/web` if no frontend exists.

### Login page

- Display the product/app name and a “Continue with Google” action.
- Use Google Identity Services, configured with a public `VITE_GOOGLE_CLIENT_ID`.
- Send the returned ID token to `POST /api/auth/google`.
- On success, retain the application access token according to the existing frontend session design and navigate to the dashboard.
- Show a readable error for failed sign-in.
- Do not place Google client secrets in frontend environment variables.

### Dashboard

- On initial load, restore the application session through the existing refresh flow, then fetch the authenticated user.
- Display the user's name and email.
- Display `Logged in via: Google` or `Logged in via: Email/Password`.
- Provide a working Logout action.
- If unauthenticated, redirect to the login page.
- Do not display protected dashboard content while authentication is unresolved or after logout.

### Session and security

- The refresh token is stored only in the HttpOnly cookie managed by the API.
- Do not store refresh tokens in localStorage or sessionStorage.
- The application access token must not be confused with the Google ID token.
- Configure API base URL, CORS, and local development proxy using environment configuration and existing project conventions.
- Never commit OAuth credentials or secrets.

## 10. Configuration

API environment:
- `GOOGLE_CLIENT_ID`: required for Google token verification.

Frontend environment:
- `VITE_GOOGLE_CLIENT_ID`: public Google OAuth Web Client ID used by GIS.

Document required Google Cloud Console setup:
- Create/configure an OAuth 2.0 Web application client.
- Add the exact local development and production JavaScript origins.
- Use the same client ID for frontend GIS and backend audience verification.
- No client secret is required for the GIS ID-token verification flow described here; do not add one unless a later, separately specified server-side authorization-code flow requires it.

Validate environment variables at startup through the existing env schema. Fail fast with a clear configuration error when the API is configured to support Google auth but the client ID is missing.

## 11. Architecture and implementation constraints

- Preserve Controller → Service → Repository boundaries.
- Keep Google token verification in a dedicated service or provider adapter; controllers should not implement verification logic.
- Use dependency injection consistent with the existing project.
- Use parameterized SQL and existing repository conventions.
- Create the user and identity atomically in a transaction.
- Reuse existing access-token and refresh-session services where possible; avoid duplicating token lifecycle logic.
- Keep errors compatible with the existing centralized error handling.
- Add unit tests for verification/business logic and integration tests for endpoint/session/database behavior where the current test setup permits.
- Do not weaken existing authentication middleware or cookie security settings.

## 12. Definition of done

The feature is complete when all acceptance criteria in `acceptance-criteria.md` pass, migrations work on a database with existing users and refresh sessions, existing password authentication remains functional, and Products CRUD behavior is unchanged.
