# Sign in with Apple — Technical Specification

## Flow

1. The React client loads Apple's Sign in with Apple JS SDK.
2. The user starts a popup authorization using the configured Services ID, registered HTTPS return URL, random state, and per-request nonce.
3. The client compares the returned state with the generated state and sends the one-time authorization code, nonce, and first-login name to `POST /api/auth/apple`.
4. The API creates a short-lived ES256 client-secret JWT using the Apple Team ID, Services ID, Key ID, and private key.
5. The API exchanges the single-use authorization code at Apple's `/auth/token` endpoint.
6. The API verifies the returned ID token signature against Apple's rotating JWKS, issuer, audience, expiration, nonce, and verified email claim.
7. The API identifies the user by Apple's stable `sub`, not by email. New user and provider identity are created in one database transaction.
8. The API issues the existing POS SaaS access JWT and HttpOnly refresh-token cookie. Refresh rotation preserves `authProvider=apple`.

## Endpoint

`POST /api/auth/apple`

Request:
```json
{
  "code": "one-time-authorization-code",
  "nonce": "random-per-request-nonce",
  "firstName": "Optional",
  "lastName": "Optional"
}
```

The response uses the existing `successResponse` envelope. The refresh token is delivered only as an HttpOnly cookie.

## Configuration

API-only secrets:
- `APPLE_TEAM_ID`
- `APPLE_CLIENT_ID` (Services ID)
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY` (contents of the downloaded .p8 file; use escaped newlines in .env)
- `APPLE_REDIRECT_URI`

Browser-visible:
- `VITE_APPLE_CLIENT_ID` (same Services ID)
- `VITE_APPLE_REDIRECT_URI` (must exactly match API and Apple Developer configuration)

Apple return URLs must be absolute HTTPS URLs with a domain. Localhost and plain HTTP are not accepted. Use an HTTPS development tunnel or an HTTPS staging domain.

## Identity and privacy

- Apple `sub` is the stable provider identity and is the database lookup key.
- Apple may provide a private relay email. Store it as returned; do not assume it is the user's personal inbox.
- Apple provides the user's name only on the first authorization. Persist it immediately; later logins use the stored name.
- Existing users are not automatically linked by matching email. They must sign in using the existing method first.
- The private key and generated client-secret JWT never leave the API.
- The authorization code is single-use and expires quickly; it is exchanged server-side.
