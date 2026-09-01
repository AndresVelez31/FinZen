# FIX: Restore the original ReportsView design (year/month, budget-vs-actual, savings progress, summary table)

## What was done

`ReportsView.vue` had been rebuilt (`REPORTS-24`) around a much simpler "period" filter (current month / 3m / 6m / all-time) with just 3 `StatCard`s and 2 charts (expenses-by-activity doughnut, monthly income/expense trend). The original prototype (`06be02e`) was considerably richer: a month/year selector, a cumulative balance line chart for the whole selected year, a budget-vs-actual bar chart, a savings-goal progress section, and a per-activity summary table.

Per the project's visual-fidelity rule (see the `finzen-visual-fidelity` note — the migration's job is to keep the original UI working through the new architecture, not to redesign it), this restores the original design.

## Decisions

### 1. No new `ReportService` methods needed
Everything the original design needs was already available:
- `ReportService.getPeriodSummary(start, end)` → the 3 KPI cards.
- `ReportService.getMonthlyTotals(yearStart, yearEnd)` → fed into a `reduce`-style cumulative sum in the View for the year's running-balance line chart (a presentation transformation, not a business rule — matches how the original prototype did the same accumulation directly in its own `computed`).
- `ReportService.getExpensesByActivity(start, end)` (bounded to the selected month) → actuals for the budget-vs-actual bar chart and the summary table, joined against `ActivityService.getActivities()` (filtered to `'expense'`) for the budget side.
- `ReportService.getExpensesByActivity()` (unbounded) → all-time saved amounts for the savings-goal progress bars, filtered to `'savings'`-type activities — the exact same pattern already used in `ActivitiesIndexView.vue` (`FIX-activities-card-grid-restored`).

### 2. `StatCard.vue` extended with optional `trend`/`trendUp`, not replaced
The current `StatCard.vue` (post `COMPONENT-28`) dropped the original's `trend` caption (e.g. "Julio 2026" under the value) in favor of a simpler `title`/`value`/`icon`/`variant` API. Rather than reintroducing the original's `label`/`accent` props (which would break `DashboardView.vue` and `UsersIndexView.vue`, both already migrated to the current API), `trend`/`trendUp` were added back as optional props with safe defaults (`trend: undefined` renders nothing). `DashboardView.vue`/`UsersIndexView.vue` are unaffected — verified.

### 3. `SelectorFilter` used twice (Mes, Año) instead of the single period dropdown
Matches the original exactly. Both pass `placeholder=""` — safe now that `SelectorFilter.vue`'s placeholder option is conditional (`FIX-reports-filter-dashboard-button-seed-data`).

## Validation

- `npx vue-tsc --noEmit`: 0 errors project-wide.
- `npx eslint`: clean on `ReportsView.vue` and `StatCard.vue`.
- Verified with a headless browser, both as Admin Demo and Usuario Demo: month/year selector, KPI cards with trend captions, cumulative balance line chart, budget-vs-actual bar chart, savings progress bars, and the per-activity summary table all render correctly with real seeded data; `DashboardView.vue` (also using `StatCard`) renders unchanged.
