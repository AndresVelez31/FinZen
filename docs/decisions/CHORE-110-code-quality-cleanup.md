# CHORE-110: Code quality cleanup — CRUD-only services, lint config, explicit naming, English comments, unused assets

## Status

Accepted

## Context

A single review pass surfaced several small, independent quality issues
across the frontend. None warranted its own PR on its own, so they're
grouped here as one cleanup pass, each summarized separately below.

## Decision

### 1. `TransactionService` stays CRUD-only

`TransactionService.filterTransactions()` (and its `TransactionFilterCriteria`
interface) was the last non-CRUD method left on a domain service. Its only
caller was `ReportAnalytics.ts`. Moved both there, following the exact
precedent already set by `UTILS-109` for `getTransactionRows()`: cross-entity,
display-shaping logic doesn't belong on a service — services stay
CRUD/domain-logic only, one per entity in the class diagram.

- `TransactionService.ts`: removed `TransactionFilterCriteria` and
  `filterTransactions()`. Now only `getAll`/`getById`/`create`/`update`/`delete`.
- `ReportAnalytics.ts`: gained `TransactionFilterCriteria` and
  `filterTransactions()` (now reading `TransactionService.getAll()` instead of
  `this.getAll()`). `getUserTransactions()` and `getTransactionRows()` call
  `this.filterTransactions(...)` instead of `TransactionService.filterTransactions(...)`.

### 2. ESLint globals config was incomplete

`eslint.config.ts` declared a hand-picked allowlist of browser globals
(`document`, `getComputedStyle`, `setTimeout`, `MutationObserver`) instead of
using the standard browser globals set. Real, correct code using
`localStorage` (`PiniaConfig.ts`), `Event`/`HTMLSelectElement`
(`SelectorFilter.vue`), and `HTMLCanvasElement` (`ChartGraphic.vue`) was
failing `no-undef` — the globals list was missing entries, not the code.
Added the four missing globals as `readonly`.

### 3. `ChartGraphic.vue` used `any` instead of `unknown`

`datasets?: ChartDataset[] | any[]` and `options?: ChartOptions | Record<string, any>`
existed to let each caller pass its own chart-specific dataset/option shape
without fighting Chart.js's discriminated `ChartDataset<TType>` union.
Replaced both `any`s with `unknown` (same permissiveness at the prop
boundary, but `@typescript-eslint/no-explicit-any` no longer fires), adding
an explicit `as ChartDataset[]` cast where `props.datasets` is finally handed
to the `Chart` constructor — mirroring the cast `baseOptions() as ChartOptions`
already had one line below.

### 4. Comments not in English

Three comments were still in Spanish, missed by the `CHORE-105` sweep (which
was scoped to the 10 views' `<script setup>` banners, not every file):
`router/index.ts` ("Validar parámetro..."), `ChartGraphic.vue` ("Escuchar
cambios de tema..."), `seeders/transactionseeder.ts` ("Usuario Demo...").
Translated to English, per `CHORE-105`'s own rule ("Comments in English;
Spanish stays only in user-visible strings").

### 5. Explicit variable names, no abbreviations

Following the precedent set by `SERVICE-88`'s identifier cleanup, renamed
the abbreviations that were introduced in PRs after that cleanup landed:

- `TransactionsShowView.vue`: `fActivity/fAccount/fType/fMonth/fFrom/fTo` →
  `filterActivity/filterAccount/filterType/filterMonth/filterFrom/filterTo`;
  `bar`/`hasBar` → `barChart`/`hasBarChart` (matches `lineChart`/`budgetChart`
  naming already used in `ReportsView.vue`); `removeTx()` →
  `removeTransaction()`; `res` → `result` (matches the naming already used
  in `AccountsShowView.vue`/`ActivitiesShowView.vue`/`UsersShowView.vue`).
- `UsersShowView.vue`: `fRole` → `filterRole`.
- `ReportsView.vue`: `selYear`/`selMonth` → `selectedYear`/`selectedMonth`;
  `savingsActs` → `savingsActivities`.
- `RadialProgress.vue`: the `dataLabels.value.formatter` callback parameter
  `val` → `value`.

No behavior change — these are all local, page-scoped renames (nothing
exported), verified with `type-check`/`lint`.

### 6. Removed unused `public/` assets; fixed the broken favicon

None of the 9 files in `frontend/public/` (`apple-icon.png`,
`icon-dark-32x32.png`, `icon-light-32x32.png`, `icon.svg`,
`placeholder-logo.png`, `placeholder-logo.svg`, `placeholder-user.jpg`,
`placeholder.jpg`, `placeholder.svg`) were referenced anywhere in the
codebase — leftover scaffolding from the original v0 mockup. Deleted all 9.

Separately, `index.html`'s `<link rel="icon" ... href="/favicon.svg">`
pointed at a file that never existed in `public/` (the actual file was
named `icon.svg`) — the favicon has been broken, including in the tracked
`frontend/dist/` build already deployed via the GCP nginx image. Replaced
the dead link with the project's real logo: `public/logo-solo.jpeg`.

`frontend/dist/` is intentionally tracked (the GCP deployment Dockerfile
copies it straight into the nginx image), so it was rebuilt via `npm run
build` to stay in sync with both changes.

### 7. Minor comment/import cleanup in `ActivityService.ts`, `TransactionService.ts`, `AppLayout.vue`, `LoginView.vue`

Collapsed a few multi-line `lucide-vue-next` import lists to single-line,
and removed several `// Ownership check, mirroring getById()...`-style
comments that had become redundant duplicates of the same explanation
already present on the corresponding `AccountService.ts` method.

## Consequences

- `TransactionService` is now consistent with `AccountService`/`ActivityService`:
  CRUD-only, no display/filtering logic.
- `npm run type-check` and `npm run lint` both pass clean (0 errors) —
  previously there were 8 pre-existing ESLint errors (`no-undef` ×6,
  `no-explicit-any` ×2), all now fixed rather than just documented as
  baseline.
- The site's favicon now resolves instead of 404ing.
