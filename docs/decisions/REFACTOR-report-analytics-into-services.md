# REFACTOR: Move ReportAnalytics into the entity services

## Status

Accepted — supersedes the placement rule from `UTILS-109` and `CHORE-110` §1
("services stay CRUD-only; anything that reads across entities lives in
`ReportAnalytics`").

## Context

`src/utils/ReportAnalytics.ts` held every query, filter and aggregation the
views needed (transaction filtering and rows, period summaries, monthly
totals, activity progress, budget vs. actual, savings progress). Each of
those functions really acts on a single entity — it takes or iterates
transactions, or it iterates activities — but it lived in a separate
utility class, so finding "everything about transactions" meant looking in
two places. It also sat in `utils/` while importing three services, which
contradicts the guide's rule that utils are pure and sit below services
(already acknowledged as a trade-off in `REFACTOR-94`).

## Decision

Each function now lives in **the service of the entity it acts on**, and
`ReportAnalytics.ts` is deleted.

`TransactionService` (functions that take or iterate transactions):

| Before (`ReportAnalytics`)      | After (`TransactionService`)   |
| ------------------------------- | ------------------------------ |
| `filterTransactions(criteria)`  | `filter(criteria)`             |
| `getUserTransactions(from, to)` | `getByDateRange(from, to)`     |
| `getTransactionRows(criteria)`  | `getRows(criteria)`            |
| `getAvailableYears()`           | `getAvailableYears()`          |
| `summarize(transactions)`       | `summarize(transactions)`      |
| `getPeriodSummary(from, to)`    | `getPeriodSummary(from, to)`   |
| `aggregateExpensesByActivity()` | `aggregateExpensesByActivity()` |
| `getMonthlyTotals(from, to)`    | `getMonthlyTotals(from, to)`   |
| `getCumulativeBalanceByMonth()` | `getCumulativeBalanceByMonth()` |

`ActivityService` (functions that iterate activities):

| Before (`ReportAnalytics`)        | After (`ActivityService`)     |
| --------------------------------- | ----------------------------- |
| `getExpensesByActivity(from, to)` | `getExpenseTotals(from, to)`  |
| `getBudgetVsActual(from, to)`     | `getBudgetVsActual(from, to)` |
| `getSavingsProgress()`            | `getSavingsProgress()`        |
| `getActivityProgress()`           | `getProgress()`               |

Renames follow `SERVICE-88`: a method on `XService` doesn't repeat the
entity name (`getTransactionRows` → `getRows`, `getActivityProgress` →
`getProgress`). Method bodies are unchanged apart from `ReportAnalytics.x`
→ `this.x` / `OtherService.x`.

The result types (`TransactionFilterCriteria`, `TransactionRowInterface`,
`PeriodSummary`, `MonthlyTotal`, `ExpenseBucket`, `ActivityProgress`,
`ActivityExpenseEntry`, `BudgetVsActual`, `SavingsProgress`) are exported
from the service that produces them. `src/interfaces/` stays reserved for the
four domain entities on the class diagram.

Updated call sites: `OverviewView.vue`, `TransactionsShowView.vue`,
`ReportsView.vue`, `ActivitiesShowView.vue`, and the `TransactionRowInterface`
type import in `RecentTransactionsTableComponent.vue` and
`TransactionsTableComponent.vue`. `README.md` and `CLAUDE.md` no longer list
`ReportAnalytics` as a layer.

### Circular import between `ActivityService` and `TransactionService`

`TransactionService` already imported `ActivityService` (to validate
`activityId` and to join activity names into rows); `ActivityService` now
imports `TransactionService` (to read the user's transactions for its
expense totals). `SECURITY-account-ownership-and-reactive-forms` avoided
exactly this cycle. It is safe here because both classes only reference each
other **inside static method bodies**, never at module-evaluation time, so ES
module live bindings are fully resolved by the time any method runs. If a
future change needs one of them at module top level (e.g. a top-level
constant computed from the other), the cycle must be broken first.

## Consequences

- Everything about an entity — CRUD, ownership, queries and aggregations —
  is in one file.
- Services are no longer CRUD-only; `CLAUDE.md` documents the new rule:
  queries go on the service of the entity the action is on.
- `docs/architecture/finzen-architecture.drawio` (and its exported PNGs)
  still shows `ReportAnalytics.ts` under `utils/` and needs to be redrawn.

## Validation

- `npm run type-check`: no errors.
- `npx oxlint .` and `npx eslint .` (run without `--fix`): no errors.
- No remaining references to `ReportAnalytics` or the old method names in
  `frontend/src/`.
