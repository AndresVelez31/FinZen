# Coding Style Guide (Back-end)

The back-end style is enforced with the linter and the formatter chosen for the project. This page
explains how to use them (option ii of the deliverable).

## 1. Tools

| Tool | What it checks | Where it is configured | When it runs | How to run it (from `backend/`) |
| --- | --- | --- | --- | --- |
| **Prettier** | Formatting, same rules as the front-end: single quotes, semicolons, 100 columns, trailing commas | `.prettierrc` | Before every commit | `npm run format` (rewrites `src/`) |
| **OXLint** (type-aware) | Lint rules plus type-based rules such as `no-floating-promises` (a promise nobody awaits) | `.oxlintrc.json` | Before every commit and in CI | `npm run lint` |
| **TypeScript compiler** | Types in strict mode | `tsconfig.json` | On every build and in CI | `npm run build` |
| **TypeORM CLI** | Generates the migration that matches the entities | `src/database/data-source.ts` | Every time an entity changes | `npm run migration:generate -- src/database/migrations/<Name>` |
| **GitHub Actions** | Runs `lint` and `build` on every PR | `.github/workflows/ci.yml` | Automatically on each PR to `main` | — |

`no-floating-promises` is set to `error`: every call that returns a promise must be awaited or
returned.

## 2. Naming (Nest.js conventions)

| Element | File | Class |
| --- | --- | --- |
| Module | `accounts.module.ts` | `AccountsModule` |
| Controller | `accounts.controller.ts` | `AccountsController` |
| Service | `accounts.service.ts` | `AccountsService` |
| Entity | `entities/account.entity.ts` | `Account` (singular) |
| DTO | `dto/create-account.dto.ts` | `CreateAccountDto` |
| Interface | `interfaces/credentials.interface.ts` | `CredentialsInterface` |
| Credential provider | `jwt-auth.provider.ts` | `JwtAuthProvider` |
| Guard / decorator | `roles.guard.ts`, `decorators/roles.decorator.ts` | `RolesGuard`, `Roles` |
| Enum | `enums/role.enum.ts` | `Role` |
| Migration | `<timestamp>-<Name>.ts` | `<Name><timestamp>` |

Controller methods use the Nest names `findAll`, `findOne`, `create`, `update`, `remove`.

## 3. TypeScript

- ES modules: relative imports end in `.js` (`'./accounts.service.js'`).
- `import type` for types. Exception: DTO classes used in `@Body()` are imported as values because
  Nest reads their metadata.
- Entity relations are typed with `Relation<>` on both sides.

## 4. Order inside a file

- `// Imports` above the import block and `// Exports` above what the file exports (above its
  decorators and comments), in every file.
- Imports sorted alphabetically: packages first (`@nestjs/...`, `typeorm`), then relative paths.
- Every method that returns a promise is `async` and uses `await`, in services and controllers.
- Services: constructor, public methods in CRUD order (`findAll`, `findOne`, `create`,
  `update`, `remove`), then private helpers.

## 5. Comments and messages

- Comments in English and only to explain *why*.
- Error messages returned to the client are in Spanish because the SPA shows them as they come.
