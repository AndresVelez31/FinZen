# AUTH-166: Sign-up

## Status

Accepted

## Context

- The only way to get an account was the two users inserted by the demo migrations; a new person
  could not use the application.
- The guide followed by the team (https://docs.nestjs.com/security/authentication, "Add sign-up and
  sign-in") defines a `SignUpDto` (`email`, `password` of 12 to 128 characters), a public
  `POST /auth/sign-up` that answers `ConflictException` when the e-mail exists, hashes the password
  with `PasswordHasher.hash()` and signs the user in.

## Decision

- **Endpoint.** `POST /api/auth/sign-up` (public, `201`) follows the guide: it normalizes the
  e-mail, answers `409` ("Ya existe una cuenta con ese correo.") if it exists, hashes the password
  with `PasswordHasher.hash()`, creates the user and signs them in. The controller is now
  `@Controller('auth')` with the routes `sign-up`, `token`, `token/refresh` and `token/revoke`, so
  the URLs of AUTH-160 do not change. The sign-in DTO is renamed `LoginDto` to `SignInDto`, the
  name the guide uses.
- **Differences from the guide.**
  - The guide opens a session cookie; the SPA is a token client, so the response is the same token
    pair as the sign-in (`TokenService.issue()` with `amr: ['pwd']`), and the SPA stores it like
    after a login.
  - `SignUpDto` also has `name`, because `User` requires it (at most 80 characters).
  - The role is always `user` and the account starts active; the client cannot choose them.
  - The e-mail is trimmed, lowercased and normalized to NFC (`AuthService.normalizeEmail()`, shared
    with the sign-in), so the same address typed in different ways is stored once.
- **Frontend.** `RegisterView` (`/register`, public) validates the same rules before the request
  and calls `AuthService.register()`, which shares `startSession()` with `login()`. `LoginView` and
  `RegisterView` share the two-panel shell in `AuthLayoutComponent`, and each links to the other.
  An authenticated user is redirected away from both routes.
- **Passwords.** The sign-up requires 12 to 128 characters. The demo passwords (`admin123`,
  `user123`) stay shorter because they come from the seed migrations, and the sign-in only checks
  that the field is not empty.
- **Out of scope.** There is no e-mail verification and no rate limiting.

## Consequences

- Anyone can create a regular account; administrators are still only created in the database.
- Two requests with the same new e-mail can race: the second one fails on the unique index with a
  `500` instead of a `409`. It is accepted for this project.
