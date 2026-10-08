# Coding Style Guide (Backend)

The back-end style is enforced with the linter and the formatter chosen for the project. This page
explains how to use them (option ii of the deliverable). The naming and code conventions are in
[Programming Rules (Backend)](<Programming-Rules-(Backend)>).

## 1. Tools

Every command below runs from the `backend/` folder. There is no ESLint in the back-end: OXLint is the only linter.

### 1.1 Code formatting (Prettier)

- **What it checks:** formatting only, same rules as the front-end (single quotes, semicolons, 100
  columns, trailing commas). It formats `src/**/*.ts`.
- **Config:** `.prettierrc`.
- **Modifies files:** yes, `--write` rewrites them.
- **When:** while coding (or on save) and before every commit.

```bash
cd backend
npm run format
```

### 1.2 Linting (OXLint, type-aware)

- **What it checks:** lint rules plus type-based rules. `typescript/no-floating-promises` is set to
  `error`: every call that returns a promise must be awaited or returned.
- **Config:** `.oxlintrc.json`.
- **Modifies files:** no, it only reports.
- **When:** while coding, before every commit and in CI.

```bash
cd backend
npm run lint
```

### 1.3 Type checking (TypeScript)

- **What it checks:** types in strict mode. There is no separate type-check script: `nest build`
  compiles the project with the TypeScript compiler and fails on a type error.
- **Config:** `tsconfig.json`.
- **Modifies files:** it writes the compiled output to `dist/` only.
- **When:** before every commit and in CI.

```bash
cd backend
npm run build
```

### 1.4 Migrations (TypeORM CLI)

- **What it does:** generates the migration that matches the entities.
- **Config:** `src/database/data-source.ts`.
- **Modifies files:** yes, it creates a migration file.
- **When:** every time an entity changes.

```bash
cd backend
npm run migration:generate -- src/database/migrations/<Name>
```

### 1.5 Before every commit

```bash
cd backend
npm run format
npm run lint
npm run build
```

CI (`build-test`, `backend` and `docker` in `.github/workflows/ci.yml`) runs on every PR to `main`
and must be green to merge. The `backend` job runs `lint` and `build`.

