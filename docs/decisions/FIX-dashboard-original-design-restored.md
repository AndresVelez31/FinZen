# FIX: Restore original DashboardView design

## What was done

`DASHBOARD-17` rebuilt `DashboardView.vue` with 4 KPI cards (no trend captions), a line chart ("Tendencia de gastos", last 6 months) in a `1fr 1fr` grid, and a recent-transactions table with `date`/`type` columns and no link back to the full list. The original prototype (`06be02e`) used 3 KPI cards with trend captions, a doughnut chart ("Gasto por actividad", current month) in a `380px 1fr` grid, and a recent-transactions table with `activityId`/color-dot styling plus a "Ver todas" link to `/transactions`. Restored per the project's visual-fidelity rule.

## Decisions

### 1. `account.name` instead of the original's `account.bank`
The original table showed each transaction's account subtitle via `accountById(row.accountId)?.bank`. Per the already-agreed domain-model exception (`finzen-domain-model-strict`), `AccountInterface` has no `bank` field — the bank name lives in `Account.name` instead (e.g. `"Bancolombia"`). Used `AccountService.getAccountById(...)?.name` for the same visual result.

### 2. No new `Service` methods needed
The doughnut (expense-by-activity for the current month) and the 3 KPI totals are built the same way `DashboardView.vue` already did before this fix — direct `.filter()`/`.reduce()` over `TransactionService.getTransactions()` plus `ActivityService.getActivityById()`/`AccountService.getAccountById()` lookups per row. No aggregation logic was duplicated from `ReportService`; this is the same shape of computation the pre-fix `DashboardView.vue` already had, just regrouped by activity instead of by month.

## Validation

- `npx vue-tsc --noEmit`: 0 errors project-wide.
- `npx eslint`: clean on `DashboardView.vue`.
- Verified with a headless browser, both as Admin Demo and Usuario Demo: 3 KPI cards with trend captions, doughnut chart matching the reference screenshot, "Ver todas" link navigates to `/transactions`, recent-transactions table shows activity chips, account name subtitles, and colored amounts.
- Full 8-page smoke test: zero console errors for both users.
