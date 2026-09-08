# UTILS-109: ReportAnalytics.getTransactionRows()

## Status

Accepted

## Context

`RecentTransactionsTable.vue` and `TransactionsTable.vue` both received raw
`TransactionInterface[]` and independently resolved the activity name/color
and account name **per row, inline in the template**, via
`ActivityService.getById(transaction.activityId)` and
`AccountService.getById(transaction.accountId)` — the same join,
implemented twice, in two slightly different styles (one called the
services directly in the template, the other wrapped them in local
`getActivity()`/`getAccount()` helpers).

Besides the duplication, this is an O(rows) linear-scan lookup per cell on
every render — it gets worse as the account/activity/transaction lists
grow, exactly the kind of thing a join should avoid.

## Decision

Added `ReportAnalytics.getTransactionRows(criteria?)`, returning
`TransactionRowInterface[]` (a `TransactionInterface` plus `activityName`,
`activityColor`, `accountName`). It reuses
`TransactionService.filterTransactions()` for the actual filtering/date-desc
ordering, then joins in a single pass using two `Map`s (`accountsById`,
`activitiesById`) built from `AccountService.getAll()`/`ActivityService.getAll()`
— one lookup per Map per row, not a linear scan.

**This method was first written directly on `TransactionService`, then
moved here.** Joining a transaction with its activity/account for display
is a cross-entity, display-shaping operation — not a CRUD operation on the
`Transaction` entity itself, so it doesn't belong on a service. It's the
same category of work every other method in this class already does
(`getActivityProgress`, `getBudgetVsActual`, `aggregateExpensesByActivity`,
...): combine data from multiple services into a read-only, display-ready
shape. Services stay CRUD/domain-logic only, one per entity in the class
diagram; anything that reads across entities for a view lives in
`ReportAnalytics`.

`TransactionRowInterface` lives here too, next to `ActivityProgress`,
`BudgetVsActual`, etc. — not in `src/interfaces/`, which is reserved for
the domain-model interfaces on the class diagram (`User`, `Account`,
`Activity`, `Transaction`), not derived/query shapes.

Fallback values when a transaction's activity/account can't be resolved
(`'Otros'` / `'#94a3b8'` for activity, matching this class's existing
"other" bucket in `aggregateExpensesByActivity`; `'—'` for account) are
defensive only — both `AccountService.delete()` and `ActivityService.delete()`
cascade-delete their transactions, so this should never actually trigger in
normal use.

Updated to consume it instead of resolving names themselves:
- `RecentTransactionsTable.vue`, `TransactionsTable.vue` — dropped their
  `ActivityService`/`AccountService` imports (and, for `TransactionsTable`,
  the `getActivity`/`getAccount` helpers) entirely; they now just read
  `row.activityName`/`row.activityColor`/`row.accountName`.
- `OverviewView.vue` — `recentTransactions` now calls
  `ReportAnalytics.getTransactionRows().slice(0, 5)` directly (the
  intermediate `transactions` computed it used to slice was otherwise
  unused, so it's gone too, along with the now-unneeded `TransactionService`
  import).
- `TransactionsShowView.vue` — `filtered` calls
  `ReportAnalytics.getTransactionRows(criteria)` instead of
  `TransactionService.filterTransactions(criteria)`; `onEdit`/`removeTx`
  now type their parameter as `TransactionRowInterface`, matching what
  `TransactionsTable` actually emits. `TransactionService` is still
  imported there for `TransactionService.delete()`.

## Consequences

- One join, one place, one behavior — no more risk of the two table
  components' fallback text/colors drifting apart.
- Services stay pure CRUD/domain logic, consistent with every other entity
  service in the project.
- `npm run type-check`, `npm run build`, and `npm run lint:eslint` all pass
  with the same pre-existing 8-error baseline.
- Any future transaction table component should consume
  `ReportAnalytics.getTransactionRows()` rather than re-introducing a
  per-cell join.
