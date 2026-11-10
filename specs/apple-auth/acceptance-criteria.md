# Sign in with Apple — Acceptance Criteria

- [ ] Login screen shows Continue with Apple when Apple web configuration is present.
- [ ] Client generates a fresh state and nonce for each login.
- [ ] Client rejects a mismatched state.
- [ ] API exchanges the one-time code with Apple using a server-generated ES256 client secret.
- [ ] API validates Apple JWKS signature, issuer, Services ID audience, expiry, nonce, and verified email.
- [ ] User is found by stable Apple subject, not email.
- [ ] First-login name is stored; later logins do not require Apple to resend it.
- [ ] Private relay emails are accepted.
- [ ] New user and Apple identity are inserted transactionally.
- [ ] Existing accounts are not silently linked by email.
- [ ] Existing JWT, refresh rotation, /api/me, and logout report Apple as provider.
- [ ] Apple private key remains server-side.
- [ ] API and frontend builds pass and a real Apple account login succeeds.
