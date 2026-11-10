# Facebook Authentication — Acceptance Criteria

- [ ] Login page displays Continue with Facebook when `VITE_FACEBOOK_APP_ID` is configured.
- [ ] Facebook SDK requests only `email` and `public_profile`.
- [ ] Client sends the returned access token to `POST /api/auth/facebook`.
- [ ] API rejects invalid, expired, wrong-app, non-user, or mismatched Facebook tokens.
- [ ] API rejects login if Facebook does not return an email.
- [ ] New Facebook users are created with a null password hash and a `facebook` identity in one transaction.
- [ ] Existing Facebook identities sign in to the same POS SaaS user.
- [ ] An existing account with the same email is not silently linked.
- [ ] API returns the existing response envelope and sets the HttpOnly refresh cookie.
- [ ] Access JWT, refresh rotation, `/api/me`, and logout preserve the Facebook provider.
- [ ] Dashboard displays `Logged in via: Facebook`.
- [ ] Google and password authentication continue to work.
- [ ] Facebook App Secret is never exposed to the browser.
- [ ] API typecheck/build and frontend build pass.
