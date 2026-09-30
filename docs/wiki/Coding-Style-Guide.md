# Coding Style Guide (Front-end)

The style is enforced by tools, not by memory. This page says which tool does what, when it runs,
where it is configured and how to run it. The back-end has its own page:
[Backend Coding Style Guide](Backend-Coding-Style-Guide).

## 1. Tools

| Tool | What it checks | Where it is configured | When it runs | How to run it (from `frontend/`) |
| --- | --- | --- | --- | --- |
| **Prettier** | Formatting: single quotes, semicolons, 2 spaces, 100 columns, trailing commas | `.prettierrc.json` | Before every commit | `npm run format` (rewrites `src/`) |
| **OXLint** | Fast lint rules for TS and Vue (unused code, suspicious patterns) | `.oxlintrc.json` | Before every commit and in CI | `npm run lint` (fixes) / `npm run check:lint` (only reports) |
| **ESLint** | Vue rules (`eslint-plugin-vue`) and TypeScript rules | `eslint.config.ts` | Together with OXLint | same scripts as OXLint |
| **vue-tsc** | Types in `.ts` and `.vue` files (strict mode) | `tsconfig.app.json` | Before every commit and in CI | `npm run type-check` |
| **Vitest** | Unit tests of services and utils | `vitest.config.ts`, `tests/` | Before opening a PR and in CI | `npm run test:unit` |
| **GitHub Actions** | Runs `check:lint`, `test:unit` and `build` on every PR | `.github/workflows/ci.yml` | Automatically on each PR to `main` | — |

A PR is only merged when CI is green. `npm run lint` and `npm run format` modify files: run them,
review the diff, and commit the result.

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

Every `.ts` file starts its import block with `// Imports` and puts `// Exports` above what it
exports (above its comments and decorators).

Imports are sorted alphabetically by path: external packages first, then `@/...`; a value import
goes before a type import of the same path.

`<script setup>` blocks use these section comments, in this order and only when the section has
content:

```ts
// Imports
// Types
// Props / // Emits
// State
// Computed
// Actions
// Watchers
// Lifecycle
```

`onMounted` always goes last, never between variables.

## 5. Comments

- In English. Spanish only in text the user sees.
- They explain *why* (a domain rule, a workaround), never repeat what the code says.
