# SERVICE-41: Implement ReportService

## What was done

- Created `src/services/ReportService.ts` containing strictly static methods.
- Implemented `getExpensesByActivity()`, `getMonthlyTotals()`, `getPeriodSummary()`.
- Removed `getExpensesByActivity(activityId)` from `ActivityService` (see #12 discussion) and rebuilt it in `ReportService` as a grouped, all-activities version suited for the doughnut chart.

## Decisions

### 1. Separate from TransactionService (Single Responsibility Principle)
Issue #12 originally described `TransactionService` as covering CRUD, filters, **and** monthly totals. Analytics/aggregation logic (grouping, summing across entities) is a distinct responsibility from CRUD persistence, so it was split into its own `ReportService`. `TransactionService` (#12) stays focused strictly on create/read/update/delete and simple filters.

### 2. Static Method Pattern
Following the standard established in `UserService`, `AccountService`, and `ActivityService`, all methods are static.

### 3. No duplicated per-activity logic
`ActivityService` briefly gained a `getExpensesByActivity(activityId): number` helper. That was reporting logic living in the wrong layer (`ActivityService` owns activity CRUD, not aggregation), so it was removed and replaced by `ReportService.getExpensesByActivity()`, which groups expenses across all of the current user's activities in one pass instead of requiring one call per activity.

### 4. User scoping via account ownership
`TransactionInterface` has no direct `userId` (per `docs/domain-model.md`). All `ReportService` methods scope results to the currently active user by first resolving the user's accounts (`AccountService.getAccounts()`) and filtering transactions whose `accountId` belongs to that set.

### 5. Optional date-range filtering
All three public methods (and the shared `getUserTransactions()` helper) accept optional `startDate`/`endDate` (ISO `YYYY-MM-DD`, inclusive on both ends). This was initially deferred to keep the first pass simple, but #24 (`ReportsView`) requires a single time-period filter (current month, last 3 months, last 6 months, all-time) that drives *every* chart on the page, including the expenses-by-activity donut — not just the summary cards. The filtering logic lives once in `getUserTransactions()` and every other method threads the same two parameters through it, avoiding duplication.

## Validation

- `npm run type-check` passes cleanly for the new/modified service files (pre-existing errors in legacy views importing `@/store` are unrelated).
- `npx eslint src/services/ReportService.ts src/services/ActivityService.ts` reports no issues.
