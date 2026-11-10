# Google Authentication — Acceptance Criteria

These criteria define the observable behavior required before the feature can be considered complete.

## A. Google sign-in

- [ ] A visitor can open the login page and see a “Continue with Google” action.
- [ ] The frontend obtains a Google ID token through Google Identity Services.
- [ ] The frontend sends the ID token to `POST /api/auth/google`.
- [ ] The API verifies signature, expiry, issuer, audience, and verified-email status server-side.
- [ ] A valid first-time Google sign-in creates one local user and one Google identity.
- [ ] Repeated sign-ins using the same Google `sub` resolve to the same local user.
- [ ] Two concurrent first-time sign-ins for the same Google identity do not create duplicate users or identities.
- [ ] The API issues its own access JWT and refresh session; it never uses the Google ID token as the application's API token.
- [ ] The API sets the refresh token only in the HttpOnly cookie and does not return it in the response body.

## B. Invalid credentials and account conflicts

- [ ] Missing or malformed `idToken` is rejected with HTTP 400.
- [ ] Invalid, expired, wrong-issuer, wrong-audience, or unverified-email credentials are rejected with HTTP 401.
- [ ] A Google email matching an existing unlinked password account is not silently linked; the API returns HTTP 409 with a safe explanation.
- [ ] Google verification errors do not leak token contents, secrets, or sensitive provider internals to the client.

## C. Session lifecycle

- [ ] Refreshing the browser page restores a valid session using the existing refresh endpoint/cookie.
- [ ] Refresh-token rotation preserves the authentication provider.
- [ ] The authenticated `me` endpoint returns the current user and the provider for the active session.
- [ ] Logout revokes the refresh session and clears the refresh cookie.
- [ ] After logout, the dashboard is inaccessible until the user signs in again.
- [ ] A revoked or expired refresh token cannot restore a session.

## D. Dashboard UI

- [ ] After successful Google sign-in, the user is navigated to the dashboard.
- [ ] The dashboard displays the local user's name and email.
- [ ] The dashboard displays `Logged in via: Google` for a Google session.
- [ ] An existing password login displays `Logged in via: Email/Password`.
- [ ] The Logout action works and returns the user to the login page.
- [ ] Protected content is not shown while session restoration is pending or when the user is unauthenticated.
- [ ] API/network errors are shown in a user-readable way without exposing internal details.

## E. Existing authentication and compatibility

- [ ] Existing email/password registration still works.
- [ ] Existing email/password login still works for users with a non-null password hash.
- [ ] A Google-only user with a null password hash cannot log in using email/password; the response is the same generic invalid-credentials response used for incorrect passwords.
- [ ] Existing refresh-token rows migrate with a compatible provider value (for example, `password`).
- [ ] Existing access tokens and sessions continue to behave according to the existing application contract.
- [ ] Existing authenticated routes continue to use the application's access JWT.

## F. Database and code quality

- [ ] Migrations apply successfully to a database containing existing users and refresh tokens.
- [ ] The identity table enforces unique provider + provider user ID.
- [ ] The identity table enforces the one-Google-identity-per-local-user policy.
- [ ] Creating a local user and its identity is atomic; a failed identity insert does not leave an orphaned user.
- [ ] Provider verification, auth service logic, and API behavior have appropriate automated tests.
- [ ] TypeScript typecheck and the repository's available lint/test/build checks pass.

## G. Regression protection and scope

- [ ] Products CRUD behavior is unchanged.
- [ ] No Firebase dependency or Firebase configuration is introduced.
- [ ] No RBAC, roles, permissions, or business-membership changes are introduced as part of this feature.
- [ ] No OAuth client secret, private key, or token is committed to the repository.
- [ ] The feature is implemented only on `spec/google-auth-demo` until explicitly approved for merge.
