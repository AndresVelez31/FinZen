# CHORE: Section banners split imports and reactive state

## Status

Accepted. Supersedes the single `// Imports` banner of `CHORE-122` and the `// State` banner of
`CHORE-105`.

## Context

`CHORE-122` put every file under one `// Imports` banner, and `CHORE-105` grouped every
`<script setup>` under `// State` and `// Computed`. `// State` mixed values that are not reactive
(`useRouter()`, constants such as `TYPES`, `let chartInstance`) with `ref()` state, so a reader
could not tell from the banner which values the template reacts to. `// Imports` also mixed
packages with project files, although they were already sorted that way.

## Decision

Every `.ts` and `.vue` file in `frontend/` and `backend/`, tests included, uses these banners, in
this order and only when the section has content:

| Banner | Holds |
| --- | --- |
| `// External imports` | Packages: `vue`, `axios`, `@nestjs/...`, `typeorm`, `vitest` |
| `// Internal imports` | Project files: `@/...` and relative paths |
| `// Types` | Local types (`.vue`) |
| `// Props` / `// Emits` | `defineProps` / `defineEmits` (`.vue`) |
| `// Variables` | Values that are not reactive on their own: `useRoute()`, `useRouter()`, stores, constants, `let` variables the template never reads |
| `// Reactive variables` | Everything declared with `ref()` |
| `// Selectors` | What feeds a filter or a picker: its options and the picked value, whether they are `computed()` or `ref()` |
| `// Computed` | Every other value declared with `computed()` |
| `// Actions` | Functions and handlers (`.vue`) |
| `// Watchers` | `watch()` (`.vue`) |
| `// Lifecycle` | `onMounted`, `onUnmounted` (`.vue`) |
| `// Exports` | What a `.ts` file exports |

`Selectors` follows section 8.6 of the course guide (`Documentos/ARQUITECTURA.md`), where
`selectorCategories` and `selectedCategory` sit under `// selectors`, apart from `// computed`. A
selector is grouped by what it does, not by how it is declared: `years` in `ReportsView` is a
`computed` and `filterRole` in `UsersShowView` is a `ref`, and both are selectors. The selectors
moved there are the filters of `TransactionsShowView` and `UsersShowView`, the month and year of
`ReportsView` and the demo accounts of `LoginView`. Option lists that never change and are shared
across views belong in `enums/constants.ts` (`MONTH_OPTIONS`, `USER_ROLE_OPTIONS`) instead.

The two import blocks are separated by a blank line. Inside each block the imports stay sorted
alphabetically by path.

Splitting `// State` moved the variables above the reactive variables in a few files
(`ReportsView`'s `now`, `ChartGraphicComponent`'s `let` variables). Nothing reads a `ref` while
declaring a variable, so the order is safe, and TypeScript would reject a value used before its
declaration.

## Consequences

- Comments and declaration order only: no behaviour change.
- `Coding-Style-Guide-(Frontend).md`, `Coding-Style-Guide-(Backend).md` and
  `Programming-Rules-(Backend).md` describe the new banners. `CHORE-105` and `CHORE-122` keep the
  old ones, since they record the convention of their time.
