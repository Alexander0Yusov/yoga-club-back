1. Replace the contents of `test/1_users.e2e-spec.ts` auth section with a dedicated `describe('auth lifecycle')` block and ensure it does not run `deleteAllData` between lifecycle steps (keep DB reset only in the outer `beforeAll`).
2. Initialize the app in `beforeAll` via `initSettings({ useEmailServiceMock: true, tokenExpiresIn: { access: '2s', refresh: '10s' } })` and keep references to `app`, `userTestManger`, and `emailServiceMock` for the lifecycle flow.
3. Add a test: `POST /auth/registration` with valid data returns `204` and `EmailServiceMock.sendConfirmationEmailMock` is called once.
4. Capture the confirmation `code` from the mock call arguments and add a test: `POST /auth/registration-confirmation` with that code returns `204`.
5. Add a test: `POST /auth/login` with valid credentials returns `200`, body has `accessToken`, and response sets `refreshToken` httpOnly cookie.
6. Add a test: `GET /auth/me` with the access token returns `200` and the correct user profile.
7. Add a test: `POST /auth/refresh-token` with the refresh cookie returns `200`, returns a new `accessToken`, and sets a new `refreshToken` cookie.
8. Add a test: `POST /auth/logout` with the current refresh cookie returns `204`.
9. Add a test: `POST /auth/refresh-token` with the old (revoked) refresh cookie returns `401`.
10. Add a test: `GET /auth/me` with an expired access token returns `401` (use `delay` > access TTL to expire).
11. Add a test: `POST /auth/login` with a wrong password returns `401`.
12. Add a test: duplicate registration with the same email returns `400` with validation error.
13. Add a test: resend confirmation `POST /auth/registration-email-resending` for a non-confirmed user returns `204` and triggers the email mock again.
14. Add a test: `POST /auth/registration-confirmation` with an invalid or reused code returns `400`.
15. Add a cleanup step in `afterAll`: `await mongoose.disconnect(); await app.close();` (keep as-is).
