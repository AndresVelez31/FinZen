# FIX: Restore the original card-grid + progress bar design for ActivitiesIndexView

## What was done

`ADMIN-22` had switched `ActivitiesIndexView.vue` from the original prototype's card grid (with a spent/saved progress bar per activity) to `GenericTable`, per that issue's literal acceptance criterion ("Uses TablaGenerica for rendering"), and dropped the progress bar as a feature the issue didn't explicitly request.

Comparing against the original prototype (`06be02e`) and reference screenshots made clear that visual fidelity to the original design takes priority over an individual issue's literal wording when the two conflict — this reverts to the original card-grid layout, with the progress bar reintroduced via `ReportService` instead of the direct `myTransactions`/`monthKey` filtering the prototype used.

## Decisions

### 1. Card grid restored, `GenericTable` dropped for this view
The template, all CSS, and the loading/empty states now mirror the original `ActivitiesView.vue` almost exactly (skeleton loading cards replace the fake `setTimeout`-only loading flag going unused). `AccountsIndexView.vue` already used the same card-grid pattern for its own list, so this isn't a new pattern in the codebase — `GenericTable` remains correct for `TransactionsView.vue`, `UsersIndexView.vue`, and `DashboardView.vue`'s recent-transactions list, where the original design was genuinely tabular.

### 2. Progress bar computed via `ReportService`, not duplicated aggregation logic
The original's `spentThisMonth`/`savedTotal` helpers filtered `myTransactions` directly inside the view. That aggregation already exists as `ReportService.getExpensesByActivity(startDate?, endDate?)`. Two calls are made — one bounded to the current month (for `'expense'`-type budgets), one unbounded (for `'savings'`-type goals) — and each activity picks its `used` value from whichever result matches its own type, mirroring the original's exact split between "gastado este mes" and "ahorrado en total" without recomputing the sum by hand in the view.

## Validation

- `npx vue-tsc --noEmit` / `npx eslint`: clean.
- Verified with a headless browser (Admin Demo): card grid renders with color dots, badges, progress bars, and correct gastado/ahorrado percentages matching the reference screenshot; create → edit (prefilled) → delete flow works; regular (non-admin) users are still redirected away from `/activities`.
