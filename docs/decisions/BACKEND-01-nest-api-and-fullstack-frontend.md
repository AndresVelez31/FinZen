# BACKEND-01: NestJS API and a frontend that consumes it

## Status

Accepted — supersedes the "client-only SPA" scope of Deliverable 1 (`DATA-07`, `DATA-08`,
`DATA-80`, `AUTH-100`) and the "no loading state" rule of `REFACTOR-remove-simulated-loading`.

## Context

Deliverable 2 asks for a Nest.js back-end in the same repository, data read from its database
instead of seeders, and a working login. The review of Deliverable 1 also asked for:

- an auth store (there was no real login);
- names ending in `Component`, `Service`, `Util`, `Interface`, and interfaces in their own files;
- constants in `enums/`, imports ordered alphabetically, script sections separated by comments,
  `onMounted` at the end instead of between variables, explicit names (`cards`, `fRole`...).

In class it was added that views must not use top-level `await`, asynchrony only happens in
`onMounted` (and in the event handlers that call the API), every API call uses `async`/`await`,
and a `BaseService` superclass keeps the `try/catch` in one place. Slides 28–29 (Tutorial 07)
recommend `Relation<>` on **both** sides of a relation, and slide 23 (APIs REST) says the project
must keep a migration history.

## Decision

**Back-end (`backend/`)** — NestJS 12 (ESM) + TypeORM + SQLite, following Tutorials 06–08:

- One module per entity of the class diagram (`users`, `accounts`, `activities`,
  `transactions`) plus `auth` and `home`. Global prefix `api`, CORS from `CORS_ORIGIN`.
- Relations: `@ManyToOne` + `@JoinColumn({ name: 'xId' })` + `@RelationId` for the foreign key,
  and `@OneToMany` on the other side, both typed with `Relation<>`. `accountId`/`activityId`/
  `userId` are read-only (`@RelationId`), so services write the relation (`{ account: { id } }`).
- `onDelete: 'CASCADE'` on every foreign key: deleting an account or an activity deletes its
  transactions (the behaviour the Deliverable 1 services already had).
- `synchronize: false`; `InitialSchema` is generated with the TypeORM CLI and `SeedDemoData`
  inserts the former frontend seeders (passwords hashed with scrypt by
  `PasswordHasher`). `migrationsRun: true` applies them on start.
- Authentication with the official `@nestjs/authentication` package
  (https://docs.nestjs.com/security/authentication) instead of a hand-written guard:
  `AuthenticationModule.forRoot` registers its global guard, `JwtAuthProvider` (a
  `JwtBearerProvider`) loads the active user of each token, `TokenService` issues a 15-minute
  access token and a single-use refresh token (`POST /auth/token`, `/auth/token/refresh`,
  `/auth/token/revoke`), `PasswordHasher` hashes with scrypt, and controllers read the user
  with `@CurrentUser()`. `@Public()` opens a route; roles are not part of the package, so
  `@Roles(Role.Admin)` + `RolesGuard` (an `APP_GUARD` that runs after it) stay.
  `GET /me` returns the signed-in user. The password column is `select: false` and
  `UsersService.findCredentials()` returns the hash apart from the user, so no endpoint can leak it.
- Refresh tokens are kept in memory (`allowInMemoryStorage: true`): restarting the API signs
  everyone out. Acceptable for a single-instance course project; a database store would be needed
  for more instances.
- Validation lives in each service and answers with Nest HTTP exceptions (`400`, `401`, `403`,
  `404`) whose messages are in Spanish because the SPA shows them as-is. Services only copy the
  editable fields of a body, so a request can never change a record's owner.
- Ownership: every query filters by the user in the token; another user's record is a `404`.

**Front-end (`frontend/`)**:

- `BaseService` (abstract) wraps axios: base URL from `VITE_API_BASE_URL`, `Authorization`
  header, the only `try/catch`, and conversion of any failure into an `Error` with the API
  message. A rejected access token is renewed once with the refresh token and the request retried;
  if that fails the session is cleared and `AppLayout` sends the user to `/login`.
- Every service `extends BaseService` and only does CRUD with the API through its
  `private static readonly PATH`; every method is `async` and uses `return await`, in the
  front-end and the back-end. The calculations over loaded data live in one util per service
  (`AccountUtil`, `ActivityUtil`, `TransactionUtil`) and receive the arrays as parameters
  (`TransactionUtil.summarize(transactions)`), so views derive them with `computed`.
  `AuthService` keeps the session helpers (`logout`, `getCurrentUser`, `isAdmin`).
- Views keep their data in `ref`s filled in `onMounted(async () => ...)`; no top-level `await`.
  Every API call in a view is wrapped in `try/catch` (the `onMounted` load and the `async`
  handlers such as `submit` and `delete...`), and the `catch` shows the API message with
  SweetAlert2. Form views also go back to their list when the record cannot be loaded.
  SweetAlert2 is imported statically.
- Seeders and the entity stores are deleted. `authstore` keeps `accessToken`,
  `refreshToken` and `currentUser`; `PiniaConfig` persists it with the theme under `finzenState.v4`.
- Every front-end interface lives in `src/interfaces/`, one per file with the `Interface` suffix:
  the four class-diagram entities and the derived shapes (`TransactionRowInterface`,
  `ActivityProgressInterface`, `TokenPairInterface`, the form error shapes...). `Formatters`/
  `DateRange` became `FormattersUtil`/`DateRangeUtil`, and option lists moved to
  `enums/constants.ts`.
- Every file starts its imports with `// Imports` and marks what it exports with `// Exports`.

## Consequences

- The API must be running for the SPA to show data (`npm run start:dev` in `backend/`).
- `CLAUDE.md`, the README and the wiki describe the new architecture. The Deliverable 2
  diagrams (draw.io sources + PNG) are in `docs/architecture/deliverable-2/`.
- `docs/domain-model.md` still lists `User.active` and `Transaction.updatedAt` as absent although
  both exist in the code since Deliverable 1; that pre-existing mismatch is left for a separate
  change.
- The activity delete dialog used to say the transactions would be kept, while the service
  deleted them. The text now matches the behaviour.
- `SeedDemoData` was edited (bcrypt → scrypt hashes) before this branch is merged, so no
  existing database depends on the old hashes; delete a local `database.sqlite` created earlier.
- `backend/dist` and `frontend/dist` must be rebuilt before deploying with Docker Compose.
