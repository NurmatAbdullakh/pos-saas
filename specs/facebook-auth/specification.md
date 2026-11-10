# Facebook Authentication — Technical Specification

## Goal

Add Facebook Login to the existing POS SaaS authentication flow without Firebase and without replacing password or Google authentication.

## Flow

1. The React client initializes the Meta JavaScript SDK with `VITE_FACEBOOK_APP_ID`.
2. The user clicks Continue with Facebook. The SDK requests `email,public_profile` and returns a user access token.
3. The client sends the token to `POST /api/auth/facebook`.
4. The API inspects the token with Graph API `/{version}/debug_token` using a server-only app access token.
5. The API requires a valid USER token issued to the configured Facebook App ID, verifies token expiry and data-access expiry, then requests `/me?fields=id,name,email`.
6. The API verifies that the returned Facebook user ID matches the inspected token and that an email is available.
7. The API looks up the provider subject in `user_identities`. If it is new, it creates the user and identity in one database transaction.
8. The API issues the existing POS SaaS access JWT and HttpOnly refresh-token cookie. Refresh rotation preserves `authProvider=facebook`.

## API

### `POST /api/auth/facebook`

Request:

```json
{ "accessToken": "<facebook-user-access-token>" }
```

Success response uses the existing `successResponse` envelope. The `data` object contains `user` and `accessToken`; refresh token is delivered only as an HttpOnly cookie.

## Identity rules

- Facebook subject is the provider's stable user ID, not email.
- `user_identities(provider, provider_user_id)` uniquely identifies the external account.
- Existing accounts are not automatically linked by matching email. The user must sign in with the existing method first.
- A Facebook identity and user record are inserted transactionally.
- The same refresh-token rotation, logout, and `/api/me` mechanisms are used.

## Configuration

API-only secrets:
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_GRAPH_API_VERSION` (defaults to `v26.0`)

Browser-visible setting:
- `VITE_FACEBOOK_APP_ID` (same App ID; never the App Secret)

## Security

- The app secret and app access token stay on the API.
- The API does not trust profile data supplied by the browser.
- The API verifies token validity, app audience, user-token type, subject consistency, and expiry with Meta.
- The Facebook access token is not stored in the database or returned to the browser by the API.
- Missing email or invalid/expired credentials are rejected.
