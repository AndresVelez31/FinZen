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

7. Business logic, validation and ownership checks live in the service.
8. Invalid data throws `BadRequestException`; a missing record, or a record of another user,
   throws `NotFoundException`.
9. A service copies only the editable fields of a DTO: a request body can never set `id`, `user`
   or any other field that is not part of the DTO.
10. Every query filters by the authenticated user (`where: { user: { id: userId } }`).

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
19. `POST /auth/token` signs in and returns an access token of 8 hours (`TokenService`); the
    SPA signs out by deleting it.

## Configuration

20. Configuration comes from environment variables (`PORT`, `SQLITE_PATH`, `CORS_ORIGIN`,
    `JWT_SECRET` of at least 32 characters); `.env.example` lists them and `.env` is never
    committed.
21. Every method that returns a promise is `async` and uses `await`, in services and controllers;
    no floating promises (enforced by OXLint).
22. Every file has `// External imports` above its packages, `// Internal imports` above its
    relative imports and `// Exports` above what it exports.
