# Programming Rules (Backend)

Rules for the Nest.js project in `backend/`. A PR that breaks one is sent back citing the rule
number.

## Modules

1. One module per entity of the class diagram (`users`, `accounts`, `activities`,
   `transactions`), plus `auth` and `home`.
2. `AppModule` only connects modules and the database; it has no controllers or providers of its
   own.
3. A module that needs another module's service imports that module, which lists the service in
   `exports` (e.g. `TransactionsModule` imports `AccountsModule`).

## Controllers

4. A controller only receives the request, reads the params, body and `request.user`, and calls
   its service. No business logic and no repository access.
5. Every method declares its return type (`Promise<Account[]>`); entities are imported with
   `import type`.
6. Routes follow REST: `GET /accounts`, `GET /accounts/:id`, `POST /accounts`,
   `PATCH /accounts/:id`, `DELETE /accounts/:id`.

## Services

7. Business logic and ownership checks live in the service; the field validation lives in the
   feature validator (`<feature>.validate.ts`, an injectable `<Feature>Validator`), which the
   service calls and which keeps persistence and ownership out of it.
8. Invalid data throws `BadRequestException`; a missing record, or a record of another user,
   throws `NotFoundException`.
9. A validator copies only the editable fields of a DTO: a request body can never set `id`, `user`
   or any other field that is not part of the DTO.
10. Every query filters by the authenticated user (`where: { user: { id: userId } }`), except
    activities: they are one catalog managed by the administrators and shared by every user, so
    `ActivitiesService` reads them with `findAll` / `findOne` and a transaction may use any of them
    (its account must still belong to the user).

## Entities and database

11. Entities mirror the class diagram. Foreign keys are declared with `@ManyToOne` +
    `@JoinColumn({ name: 'xId' })` + `@RelationId`, the other side with `@OneToMany`, and both
    sides typed with `Relation<>`.
12. `@RelationId` properties are read-only: to change a foreign key, write the relation
    (`account: { id }`).
13. `synchronize` is always `false`. Every schema change is a migration generated with
    `npm run migration:generate`, and migrations are never edited once merged.
14. Sensitive columns are hidden with `select: false` (e.g. `User.password`).

## Security

15. Authentication uses the official `@nestjs/authentication` package
    (https://docs.nestjs.com/security/authentication): its global guard makes every route
    require a signed-in user unless it is marked `@Public()`. `JwtAuthProvider` verifies the
    bearer token and loads the user on every request, so a deactivated user loses access at once.
16. Controllers read the user with `@CurrentUser()` / `@CurrentUser('id')`, never
    `request.user.sub`.
17. Admin-only routes use `@Roles(Role.Admin)` (`RolesGuard`, which runs after the package guard).
18. Passwords are stored only as scrypt hashes made by `PasswordHasher`; the password column is
    `select: false` and only `UsersService.findCredentialsByEmail()` reads it, for the sign-in.
    The same message answers a wrong email and a wrong password.
19. `POST /auth/sign-up` (`SignUpDto`: name, e-mail, password of 12 to 128 characters) creates
    a regular user and signs them in. The e-mail is trimmed, lowercased and normalized to NFC;
    an existing one answers `409` (`ConflictException`); the password is hashed with
    `PasswordHasher.hash()` and the response is the token pair of `TokenService.issue()`.
    `POST /auth/token` (`SignInDto`) signs in and returns an access token of 8 hours and a refresh token of 7
    days (`TokenService`, renewable up to 30 days after the sign-in). `POST /auth/token/refresh`
    exchanges the refresh token for a new pair (`401` if it is invalid, expired or reused; a reused
    token revokes its whole session) and `POST /auth/token/revoke` signs out (`AuthService.signOut()`) (`204`, it never
    reveals whether the token existed). The access token already issued stays valid until it
    expires. The refresh tokens live in memory, so restarting the API ends the renewals. A global
    `ValidationPipe` validates the DTOs (`class-validator`) and answers `400` with a single
    Spanish `message`.

## Configuration

20. Configuration comes from environment variables (`PORT`, `SQLITE_PATH`, `CORS_ORIGIN`,
    `JWT_SECRET` of at least 32 characters); `.env.example` lists them and `.env` is never
    committed.
21. Every method that returns a promise is `async` and uses `await`, in services and controllers;
    no floating promises (enforced by OXLint).
22. Every file has `// External imports` above its packages (`@nestjs/...`, `typeorm`),
    `// Internal imports` above its relative imports, separated by a blank line, and `// Exports`
    above what it exports (above its decorators and comments). A block without imports has no
    comment, and imports are sorted alphabetically by path inside each block.

## Naming and code style

23. Files and classes follow the Nest.js conventions:

| Element | File | Class |
| --- | --- | --- |
| Module | `accounts.module.ts` | `AccountsModule` |
| Controller | `accounts.controller.ts` | `AccountsController` |
| Service | `accounts.service.ts` | `AccountsService` |
| Validator | `accounts.validate.ts` | `AccountsValidator` |
| Entity | `entities/account.entity.ts` | `Account` (singular) |
| DTO | `dto/create-account.dto.ts` | `CreateAccountDto` |
| Credential provider | `jwt-auth.provider.ts` | `JwtAuthProvider` |
| Guard / decorator | `roles.guard.ts`, `decorators/roles.decorator.ts` | `RolesGuard`, `Roles` |
| Enum | `enums/role.enum.ts` | `Role` |
| Migration | `<timestamp>-<Name>.ts` | `<Name><timestamp>` |

24. Services have the constructor, then the public methods in CRUD order (`findAllByUserId`,
    `findOneByIdAndUserId`, `create`, `update`, `remove`), then private helpers. Controller
    methods mirror their service. `UsersService` / `UsersController` and `ActivitiesService` /
    `ActivitiesController` keep `findAll` and `findOne` because they are not filtered by user.
25. ES modules: relative imports end in `.js` (`'./accounts.service.js'`). `import type` for
    types, except the DTO classes used in `@Body()`, which are imported as values because Nest
    reads their metadata.
26. Comments are in English and only explain *why*. Error messages returned to the client are in
    Spanish because the SPA shows them as they come.
