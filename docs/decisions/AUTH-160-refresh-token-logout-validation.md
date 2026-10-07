# AUTH-160: Refresh token, real logout and validated sign-in

## Status

Accepted

## Context

- The guide followed by the team (https://docs.nestjs.com/security/authentication) shows the
  refresh token, its renewal and the revocation on sign-out, and asks for validated bodies.
- The SPA ignored the refresh token: when the 8-hour access token expired the user had to sign in
  again, and signing out only deleted the token in the browser, so nothing ended on the server.
- The access token stays at 8 hours by the team's choice.
- `@nestjs/authentication` 0.0.1 does not export a `SignInDto`, so the sign-in body had no
  validation: a missing field reached the service as `undefined`.

## Decision

- **Refresh token.** `POST /auth/token` also returns a `refreshToken`. One refresh token lasts 7
  days (`ttl`) and a session renews for at most 30 days after the sign-in (`absoluteTtl`), then it
  asks for the password again. `POST /auth/token/refresh` exchanges it for a new pair.
- **Single shared renewal.** `BaseService` renews the tokens when a request answers `401` and the
  store holds both tokens, then retries that request once with the new access token. A refresh
  token is single use and presenting it twice revokes the session, so concurrent requests that fail
  together share one renewal. If the renewal fails, the original `401` ends the session.
- **Real logout.** `POST /auth/token/revoke` revokes the refresh token and answers `204` even for
  an unknown token (RFC 7009). `AuthService.logout()` clears the local session first, so the user
  is signed out whatever happens, and then calls the route. `AppLayout` does not show a failed
  revoke.
- **Validation.** A global `ValidationPipe` with `class-validator` and `class-transformer` checks
  `SignInDto` (called `LoginDto` when this was decided) and `RefreshTokenDto`. Its `exceptionFactory` answers `400` with the first constraint
  message of the first error, so the API keeps the `{ message: string }` shape the SPA shows
  as-is. `whitelist` is not enabled because the other DTOs have no decorators.
- The session persisted in the browser now includes the refresh token; `STORAGE_KEY` moves to
  `finzenState.v5`.

## Consequences

- An access token issued before the sign-out stays valid until it expires (up to 8 hours); only the
  renewal ends. Deactivating a user still cuts the access at once, because `JwtAuthProvider` loads
  the user on every request.
- The refresh tokens are kept in memory (`allowInMemoryStorage`): restarting the API loses them
  and users sign in again when their access token expires. One instance is enough for this
  project.
- Reusing a refresh token revokes the whole session, so a stolen copy that is used after the
  legitimate client renews ends both.
- Validation errors of the token routes are Spanish single messages; DTOs without decorators are
  still checked inside their services.

> Later change: the sign-in/sign-up/sign-out names were unified across the stack. `AuthService.logout()`
> is now `AuthService.signOut()`, `LoginView` is `SignInView`, `LoginResponseInterface` is
> `SignInResponseInterface`, the SPA route `/login` is `/sign-in`, and the backend `AuthService.revoke()`
> is `AuthService.signOut()` (the route `POST /auth/token/revoke` does not change).
