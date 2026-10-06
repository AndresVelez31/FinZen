# REFACTOR: Util methods named after what they do

## Status

Accepted

## Context

Most util methods were named after what they return (`getBalance`, `getRows`, `getProgress`)
or with a single generic word (`filter`, `summarize`, `ofMonth`, `initials`). From the call site
it was hard to tell what each one does: `TransactionUtil.getRows()` joins every transaction
with its account and activity, and `ActivityUtil.getProgress()` measures budgets against the
month to date but savings against their all-time total. The back-end already names methods
after the action (`findAll()`, `findOne()`, `update()`), but `UsersService.findByEmailWithPassword()`
described a detail of the query rather than what it is for. The utils and that method should read
the same.

## Decision

Every util method starts with a verb that says what it does (`calculate`, `sum`, `filter`,
`build`, `extract`...), never `get`. The class already names the entity, so the method does
not repeat it. The behaviour of every method is unchanged.

| Util | Before | After |
| --- | --- | --- |
| `AccountUtil` | `getBalance` | `calculateBalance` |
| `AccountUtil` | `getTotalBalance` | `calculateTotalBalance` |
| `ActivityUtil` | `getExpenseTotals` | `sumExpensesPerActivity` |
| `ActivityUtil` | `getBudgetVsActual` | `compareBudgetWithSpending` |
| `ActivityUtil` | `getSavingsProgress` | `calculateSavingsProgress` |
| `ActivityUtil` | `getProgress` | `calculateTargetProgress` |
| `ActivityUtil` | `getPercent` (private) | `calculatePercentOfTarget` |
| `DateRangeUtil` | `ofMonth` | `buildMonthRange` |
| `DateRangeUtil` | `currentMonthFull` | `buildCurrentMonthRange` |
| `DateRangeUtil` | `currentMonthToDate` | `buildMonthToDateRange` |
| `FormattersUtil` | `monthKey` | `extractMonthKey` |
| `FormattersUtil` | `initials` | `extractInitials` |
| `TransactionUtil` | `filter` | `filterByCriteria` |
| `TransactionUtil` | `getRows` | `attachAccountAndActivity` |
| `TransactionUtil` | `getAvailableYears` | `collectAvailableYears` |
| `TransactionUtil` | `summarize` | `summarizeIncomeAndExpense` |
| `TransactionUtil` | `aggregateExpensesByActivity` | `groupExpensesByActivity` |
| `TransactionUtil` | `getMonthlyTotals` | `sumIncomeAndExpenseByMonth` |
| `TransactionUtil` | `getCumulativeBalanceByMonth` | `accumulateBalanceByMonth` |

On the back-end, `UsersService.findByEmailWithPassword` becomes `findCredentialsByEmail`: it
returns the user with the password hash for the sign-in and nothing else reads it. The only
caller is `AuthService`.

`FormattersUtil.formatToCOP` and `FormattersUtil.formatDate` already followed the rule and keep
their names.

`ActivityUtil.sumExpensesPerActivity` and `TransactionUtil.groupExpensesByActivity` look alike
but differ: the first sums the expenses of each known activity, optionally within a date range,
and leaves out activities with no expenses; the second groups expenses by activity name, puts
unknown activities under "Otros" and sorts by total.

## Consequences

- Views, components and tests call the new names; `README.md`, `BACKEND-01` and the programming
  rules in the wiki list them.
- Older decision records keep the names they were written with, since they describe the code
  as it was at the time.
