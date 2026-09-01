# REPORTS-24: Implement ReportsView with Chart.js Analytics & Filters

## What was done

- Rebuilt `src/views/ReportsView.vue`, replacing the legacy version that imported from
  the deleted `@/store` module and used a month/year picker instead of the period
  filter this issue requires.
- Time period filter (`current | 3m | 6m | all`) built with `SelectorFiltro`; a
  `computed` translates the selected period into an inclusive `{ start?, end? }` ISO
  date range, which is passed straight into `ReportService`'s date-bounded methods.
- Doughnut chart for expenses by activity, and a line chart for the monthly income vs.
  expense trend, both rendered through `GraficoChart` with no chart-specific logic
  inside the view beyond reshaping service output into `labels`/`datasets`.
- Three `StatCard`s (total income, total expense, net balance) sourced from
  `ReportService.getPeriodSummary()`.
- Fixed `src/components/shared/GraficoChart.vue`, which still imported from the
  deleted `@/store` module (`import { store } from '@/store'`) to watch `store.theme`
  and re-render on theme change.

## Decisions

### Chart data comes from `ReportService`, not `TransactionService`
The issue's acceptance criteria say "chart data is prepared in `TransactionService`",
but `ReportService.ts` already existed on `main` (merged the same day as the domain
refactor) with exactly the four aggregation methods this view needs
(`getUserTransactions`, `getExpensesByActivity`, `getMonthlyTotals`,
`getPeriodSummary`), all already accepting an optional date range.
`TransactionService` has no equivalent aggregation methods. Unlike the `accountNumber`
case in `ACCOUNTS-21`, this didn't need architect confirmation — `ReportService` is
unambiguously the intended tool for exactly this job, so it's used directly.

### `GraficoChart.vue`'s dead theme-reactivity `watch` was removed, not rewired
`GraficoChart.vue` watched a global `store.theme` (from the deleted `@/store` module)
to re-render charts with new colors when the theme changes. Checked `AppLayout.vue`:
the current theme toggle (`appTheme`) is an explicitly-labeled temporary local `ref`
("Temporary stubs, replaced in Issue #4 + #8") that never applies the `dark` class to
the DOM — so there is no real, shared theme state to watch yet, and the old watch
never did anything functional to begin with. Rather than invent a new theme store out
of scope for this issue, the dead `watch` was deleted. Chart colors still read
`document.documentElement.classList.contains('dark')` at render/prop-change time via
`themeColors()`, so charts will render correctly for whichever theme is active on
mount — they just won't auto-refresh mid-session until a real theme store exists
(follow-up for Issue #4/#8).

### Period → date range mapping
"Current month" = first day of the current month through today. "Last 3/6 months" =
a rolling window of the current month plus the 2/5 preceding months, through today.
"All-time" passes `undefined` for both bounds, which `ReportService` already treats as
unbounded.

## Validation

- `npx vue-tsc --noEmit`, scoped to `ReportsView.vue`: no errors.
- `GraficoChart.vue` still reports its 5 pre-existing type errors (`TS7034`, `TS7005`
  ×2, `TS2322` ×2 — untyped `chart` variable, loosely-typed `type`/`datasets`/`options`
  props). These predate this issue; only the dead `@/store` import and its `watch`
  block were removed, no other lines in the file were touched.
- `npm run lint`: no errors in either `ReportsView.vue` or `GraficoChart.vue`. The 7
  errors `npm run lint` reports elsewhere (`PiniaConfig.ts`, `AppLayout.vue`,
  `SelectorFiltro.vue`) are pre-existing and untouched by this issue.
- Manual browser testing: switched between all four period filters and confirmed both
  charts and all three summary cards update reactively; confirmed the current-month
  filter correctly shows the empty state (seed data doesn't reach into August);
  confirmed doughnut segment colors match each activity's seeded `color`; confirmed
  the two-column chart grid collapses to one column below the 900px breakpoint.