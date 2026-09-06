# UTILS-82: Convert formatters into a class with static methods

## What was done

- Refactored `src/utils/formatters.ts` from three standalone exported functions
  (`formatToCOP`, `formatDate`, `monthKey`) into a single `Formatters` class with
  static methods of the same names, mirroring the static-class pattern already used
  across every file in `src/services/`.
- Updated every consumer to import `Formatters` and call the methods through it:
  - `src/utils/ReportService.ts`
  - `src/views/ReportsView.vue`
  - `src/views/TransactionsShowView.vue`
  - `src/views/DashboardShowView.vue`
  - `src/views/AccountsShowView.vue`
  - `src/views/ActivitiesShowView.vue`
  - `src/views/UsersShowView.vue`
- `AccountsShowView.vue` had its own local, duplicated `formatToCOP` helper; removed
  it and switched to `Formatters.formatToCOP` instead of keeping two copies of the
  same formatting logic.

## Decisions

### No change to formatting behavior or output
Each method's body is untouched — only the export shape changed (named functions →
static class methods). `formatToCOP`, `formatDate`, and `monthKey` produce identical
output to before this refactor.

### Duplicate `formatToCOP` in `AccountsShowView.vue` was consolidated, not left alone
While updating call sites, found that `AccountsShowView.vue` had re-implemented its own
`formatToCOP` locally instead of importing the shared one. Since this issue already
touches every `formatToCOP` call site, it was consolidated here rather than left as a
second, drifting copy — fixing it later would have meant re-touching every one of
these same files again.

## Validation

- `npm run type-check`: initially caught one missed consumer —
  `UsersShowView.vue` still imported the old named export
  (`TS2724: has no exported member named 'formatDate'. Did you mean 'Formatters'?`).
  Fixed by updating that file to import and call `Formatters.formatDate`. Final run:
  no errors.
- `npm run lint`: 13 pre-existing errors reported, none related to `formatters.ts`,
  `ReportService.ts`, or any of the seven updated call sites (`PiniaConfig.ts`'s known
  `localStorage` gap, `ChartGraphic.vue`, `SelectorFilter.vue`, and pre-existing
  `confirm` / `no-undef` errors in `AccountsShowView.vue` / `UsersShowView.vue`
  unrelated to this change).