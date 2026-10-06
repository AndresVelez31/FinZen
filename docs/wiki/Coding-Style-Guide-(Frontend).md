# Coding Style Guide (Frontend)

The style is enforced by tools, not by memory. This page says which tool does what, when it runs,
where it is configured and how to run it. The back-end has its own page:
[Coding Style Guide (Backend)](Coding-Style-Guide-(Backend)).

## 1. Tools

Every command below runs from the `frontend/` folder.

### 1.1 Code formatting (Prettier)

- **What it checks:** formatting only (single quotes, semicolons, 2 spaces, 100 columns, trailing
  commas). It formats the files in `src/`.
- **Config:** `.prettierrc.json`.
- **Modifies files:** yes, `--write` rewrites them.
- **When:** while coding (or on save) and before every commit.

```bash
cd frontend
npm run format
```

### 1.2 Linting (OXLint and ESLint)

Two linters run one after the other. `npm run lint` runs both and **modifies files** (`--fix`);
`npm run check:lint` runs both and **only reports**.

- **OXLint:** the fast first pass (unused code, suspicious patterns, Vue plugin). Config:
  `.oxlintrc.json`. Script: `npm run lint:oxlint`.
- **ESLint for Vue and TypeScript:** Vue rules and TypeScript rules. Config: `eslint.config.ts`.
  Script: `npm run lint:eslint`. It uses `eslint-plugin-vue` (`flat/essential`) and
  `@vue/eslint-config-typescript`. `eslint-plugin-oxlint` turns off the rules OXLint already
  covers, and `eslint-config-prettier` turns off the formatting rules, so Prettier is the only one
  that formats.
- **When:** `npm run lint` while coding and before every commit (review the diff it leaves).
  `npm run check:lint` is what CI runs: a lint error fails the PR instead of being rewritten
  silently.

```bash
cd frontend
npm run lint          # OXLint + ESLint, with --fix
npm run check:lint    # OXLint + ESLint, no changes (CI)
```

### 1.3 Type checking (vue-tsc)

- **What it checks:** types in `.ts` and `.vue` files (strict mode).
- **Config:** `tsconfig.app.json` and the other `tsconfig*.json` files.
- **Modifies files:** no.
- **When:** before every commit. `npm run build` runs the type check and then `vite build`, and CI
  runs it too.

```bash
cd frontend
npm run type-check
npm run build
```

### 1.4 Unit tests (Vitest)

- **What it checks:** unit tests of services and utils in `tests/`.
- **Config:** `vitest.config.ts`.
- **Modifies files:** no.
- **When:** before every commit and in CI.

```bash
cd frontend
npm run test:unit
```

### 1.5 Before every commit

```bash
cd frontend
npm run format
npm run lint
npm run type-check
npm run test:unit
```

CI (`build-test`, `backend` and `docker` in `.github/workflows/ci.yml`) runs on every PR to `main`
and must be green to merge. `build-test` runs `check:lint`, `test:unit` and `build`.

## 2. Naming

| Element | Convention | Example |
| --- | --- | --- |
| View (lists all records) | `<Entity>ShowView.vue` | `TransactionsShowView.vue` |
| View (create and edit) | `<Entity>FormView.vue` | `AccountFormView.vue` |
| Component | `<Name>Component.vue` | `StatCardComponent.vue` |
| Service | `<Entity>Service` class, same file name; route in `PATH` | `AccountService.ts` |
| Interface | `<Name>Interface`, one per file in `src/interfaces/` | `TransactionInterface.ts`, `TransactionRowInterface.ts` |
| DTO | `<Action><Entity>DTO` | `CreateAccountDTO`, `UpdateUserDTO` |
| Util | `<Name>Util` class; one `<Entity>Util` per service for what is not CRUD | `FormattersUtil`, `TransactionUtil` |
| Store | `use<Name>Store` in `<name>store.ts` | `useAuthStore` in `authstore.ts` |
| Constant list | `UPPER_SNAKE_CASE` in `enums/constants.ts` | `MONTH_OPTIONS` |
| Variables and functions | `camelCase`, full words, verb for functions | `filterRole`, `deleteAccount()` |

Names are explicit: `transaction`, not `t`; `filterRole`, not `fRole`; `activitiesProgress`, not
`cards`.

## 3. TypeScript

- Strict mode (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `verbatimModuleSyntax`).
- `import type` for anything that is only a type.
- Imports end in `.js` even when the file is `.ts`: `'@/services/AccountService.js'`.
- No `any`; use `unknown` and a local cast when a library forces it.

## 4. Order inside a file

Every `.ts` and `.vue` file splits its imports in two blocks: `// External imports` (packages:
`vue`, `axios`, `vitest`...) and `// Internal imports` (project files: `@/...` and relative
paths), separated by a blank line. A block without imports has no comment. `.ts` files put
`// Exports` above what they export (above its comments and decorators).

Inside each block, imports are sorted alphabetically by path; a value import goes before a type
import of the same path.

`<script setup>` blocks use these section comments, in this order and only when the section has
content:

```ts
// External imports
// Internal imports
// Types
// Props / // Emits
// Variables
// Reactive variables
// Selectors
// Computed
// Actions
// Watchers
// Lifecycle
```

- `Variables`: values that are not reactive on their own: `useRoute()`, `useRouter()`, stores,
  constants and `let` variables the template never reads (`chartInstance`).
- `Reactive variables`: everything declared with `ref()`: API data, form fields, UI state.
- `Selectors`: what feeds a filter or a picker: its options (`activityOptions`, `years`,
  `demoAccounts`) and the value the user picks (`filterRole`, `selectedMonth`). Option lists that
  never change and are shared go in `enums/constants.ts` (`MONTH_OPTIONS`) instead.
- `Computed`: every other value declared with `computed()`, derived from the sections above.

`onMounted` always goes last, never between variables.

## 5. Comments

- In English. Spanish only in text the user sees.
- They explain *why* (a domain rule, a workaround), never repeat what the code says.
