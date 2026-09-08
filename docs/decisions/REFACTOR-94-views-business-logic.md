# REFACTOR-94: Move business logic out of ReportsView, TransactionsShowView and UsersShowView

## What was done

- **`src/utils/constants.ts`** (new): exports `FilterOption` (the
  `{label, value}` shape `SelectorFilter.vue` and every filter dropdown in
  the app already used ad hoc) and `MONTH_OPTIONS`, the 12-entry month list
  that was declared twice, verbatim, in `ReportsView.vue` (`months`) and
  `TransactionsShowView.vue` (`monthOptions`).
- **`src/utils/DateRange.ts`** (new): `DateRange.ofMonth(year, month)`
  replaces the inline last-day-of-month calculation that lived in
  `ReportsView.vue`'s `periodEnd` computed.
- **`SelectorFilter.vue`**: now imports `FilterOption` from
  `utils/constants.ts` instead of declaring its own local copy of the same
  shape.
- **`TransactionService.ts`**: added `filterTransactions(criteria)` and its
  `TransactionFilterCriteria` type (`activityId`, `accountId`, `type`,
  `month`, `from`, `to`, all optional), consolidating the 6-condition inline
  filter that lived in `TransactionsShowView.vue`'s `filtered` computed.
  Removed `filterByType`/`filterByAccount`/`filterByMonth` — confirmed dead
  code (zero call sites anywhere in `src/`) that `filterTransactions`
  supersedes.
- **`ReportService.ts`**: added `summarize(transactions)`,
  `aggregateExpensesByActivity(transactions)`, `getAvailableYears()`,
  `getCumulativeBalanceByMonth(year)`, `getBudgetVsActual(start?, end?)`,
  and `getSavingsProgress()`. `getPeriodSummary` is now `summarize(this.getUserTransactions(...))`
  instead of duplicating the income/expense reduction inline. Also fixed a
  real N+1: `getExpensesByActivity` was calling `getUserTransactions()`
  inside its per-activity loop; it now calls it once and filters the result.
- **`ReportsView.vue`**: `years`, `periodStart`/`periodEnd`, `lineChart`,
  `expenseActivities`/`periodExpensesByActivity`/`actualFor`/`budgetChart`,
  `savingsActivities`/`allTimeExpensesByActivity`/`savingsActs`, and
  `summaryRows` all now call the `ReportService` methods above. The view
  keeps only the Chart.js dataset wrapping (colors, `borderRadius`,
  `tension`, etc.) and the `SummaryRow` mapping for `BudgetSummaryTable`.
  Script shrank from ~150 lines of aggregation logic to direct service calls.
- **`TransactionsShowView.vue`**: `filtered` now calls
  `TransactionService.filterTransactions(...)`; `bar` calls
  `ReportService.aggregateExpensesByActivity(filtered.value)`; `totals` calls
  `ReportService.summarize(filtered.value)`. `activityOptions`/`accountOptions`/`typeOptions`
  are now typed `FilterOption[]` instead of repeating the inline
  `{value,label}` shape.
- **`UsersShowView.vue`**: `changeRole`/`toggleActive` replaced the native
  `confirm()` with SweetAlert2, matching every other destructive/confirming
  action in the app. Non-destructive here (changing a role or flipping
  active status isn't deletion), so `icon: 'question'` with the primary
  green (`#10b981`) confirm button, not the red used for actual deletes.
- **`utils/ReportService.ts` renamed to `utils/ReportAnalytics.ts`**
  (class `ReportService` → `ReportAnalytics`). "Service" is this project's
  reserved suffix for the four domain services in `src/services/`
  (`AccountService`, `ActivityService`, `TransactionService`, `UserService`)
  — this class was never one of those (that's the entire premise of
  `UTILS-81`, which moved it out of `services/` in the first place), so
  keeping the suffix was misleading. Updated the three consumers
  (`ReportsView.vue`, `TransactionsShowView.vue`, `ActivitiesShowView.vue`).
- **`ReportAnalytics.getUserTransactions` no longer touches the store or
  `AccountService` directly** — it now delegates to
  `TransactionService.filterTransactions({ from: startDate, to: endDate })`,
  which already does the exact same account-ownership scoping and date-range
  filtering. This was a real duplication (two independent implementations of
  "this user's transactions in a date range") discovered while reorganizing
  `utils/`, and fixing it also resolves an actual anti-pattern the project's
  own guide calls out by name: "a util that accesses the store." Verified
  behavior-equivalent (see Decisions).
- **Extracted named interfaces** for shapes that were previously duplicated
  inline (once in a method's return type, once in a local variable
  declaration): `PeriodSummary`, `MonthlyTotal`, `ActivityExpenseEntry`. Also
  named the shape `aggregateExpensesByActivity` returns `ExpenseBucket`
  (distinct from `ActivityExpenseEntry`: a bucket is keyed by name and can be
  the synthetic `'Otros'` group with no real `activityId`; an entry always
  corresponds to one real activity).
- **`constants.ts` and `DateRange.ts` reviewed, left as-is**: `DateRange` is
  already a single-method static class, consistent with `Formatters`. The
  `FilterOption`/`MONTH_OPTIONS` pair in `constants.ts` is deliberately
  **not** wrapped in a class — it's constant data and a type, not behavior;
  wrapping it in `static readonly` fields would be less idiomatic TypeScript
  than a plain `export const`. The "one utility, one class" convention this
  project follows (`Formatters`, `DateRange`, `ReportAnalytics`) applies to
  files that expose functions, not to files that only export data.
- **Explicitly out of scope**: `LoginView.vue` and `TransactionFormView.vue`
  were reviewed and have no business logic to extract — `LoginView` already
  delegates to `UserService.login()`, and `TransactionFormView.validate()`
  is exactly the View-validates-for-UX/Service-validates-integrity split the
  architecture calls for (see `TRANSACTIONS-19`). `DashboardView.vue`,
  `AccountsShowView.vue`, and `ActivitiesShowView.vue` are deliberately
  deferred to a later pass.

## Decisions

### `FilterOption` lives in `utils/constants.ts`, not `src/interfaces/`
`interfaces/` is reserved for the four domain entities on the class diagram
(`UserInterface`, `AccountInterface`, `ActivityInterface`,
`TransactionInterface`). `FilterOption` describes a dropdown option — a UI
concern with no equivalent on the diagram — so it doesn't belong there. It's
exported from `utils/constants.ts` instead, next to the one constant
(`MONTH_OPTIONS`) that's actually shaped that way, and `SelectorFilter.vue`
imports it from there rather than the reverse (a component depending on a
util's type is the right direction; a util depending on a component's type
would not be).

### `TransactionFilterCriteria` lives next to `filterTransactions` in `TransactionService.ts`, not in `interfaces/` or `dtos/`
It isn't a domain entity shape, and it doesn't fit the DTO pattern either —
DTOs in this project are always `Omit<X,...>`/`Partial<Omit<X,...>>` derived
from an interface, and filter criteria has fields (`month`, `from`, `to`)
that don't exist on `TransactionInterface` at all. It's colocated with the
one method that consumes it, the same way `SummaryRow` lives in
`BudgetSummaryTable.vue` rather than in a shared types folder.

### Every optional field on `TransactionFilterCriteria` is typed `T | undefined`, not just `T`
`exactOptionalPropertyTypes` (on in this project's `tsconfig`) rejects
`{ activityId: undefined }` as an argument when the field is declared
`activityId?: number` — only `activityId?: number | undefined` accepts an
explicit `undefined`. `TransactionsShowView.vue` needs to pass exactly that
(`fActivity.value ? Number(fActivity.value) : undefined`), so every field
on the criteria type carries the explicit `| undefined`.

### The service returns domain data; the view still builds the Chart.js dataset
`aggregateExpensesByActivity`, `getCumulativeBalanceByMonth`, and
`getBudgetVsActual` all return plain data (`{name, color, total}`,
`number[]`, `{activityId, name, color, budget, spent, diff}`) — none of them
know about `borderRadius`, `tension`, or hex colors for a specific chart.
The views still assemble the `{labels, datasets}` object Chart.js expects.
This keeps `ReportService` reusable for any future consumer that isn't a
chart, and keeps chart-specific styling where it's always lived.

### `ReportAnalytics` now imports a third domain service — an acknowledged, pre-existing trade-off
The architecture guide's dependency direction is `Component/Service → Utils`,
i.e. utils sit *below* services and shouldn't import them. `ReportAnalytics`
already broke this before any of this PR's changes — it has always imported
`ActivityService` and `AccountService`. Adding a `TransactionService` import
to fix the store-duplication above doesn't introduce a new category of
violation, it adds one more instance of an already-accepted one. The
alternative — keeping `getUserTransactions` as its own independent
re-implementation just to avoid a third service import — would mean carrying
forward known-duplicated logic for the sake of a rule this file was already
exempted from. Flagging this explicitly rather than treating it as
"resolved": `ReportAnalytics` is not a pure util by the guide's own
definition, and hasn't been since `UTILS-81`. It's better described as an
analytics facade over the three domain services, which is exactly why it
doesn't belong in `services/` (not 1:1 with one entity) or fit cleanly under
the strict definition of `utils/` (not access-free) — it occupies a
deliberate, documented middle ground.

### Verifying `getUserTransactions`'s delegation is behavior-preserving
`TransactionService.getAll()` (which `filterTransactions` calls first) scopes
by the current user's account IDs exactly like the old
`getUserTransactions` did via its own `AccountService.getAll()` call, and
uses the same inclusive `date < from` / `date > to` comparison for range
filtering. The only difference is that `getAll()` additionally sorts by date
descending, which every caller inside `ReportAnalytics` was already
insensitive to (they group/sum, or independently re-sort their own output).

### `filterByType`/`filterByAccount`/`filterByMonth` were deleted, not deprecated
Verified via `grep -rn` across `src/` that nothing calls them — they were
already dead code before `filterTransactions` existed. Keeping unused public
methods "just in case" is exactly the kind of dead code the project's own
clean-code rules call out; deleting them alongside their replacement avoids
a second pass later to notice and remove them.

## Validation

- `npm run type-check`: no errors.
- `npm run build`: succeeds, no new warnings.
- `npm run lint`: 9 errors (down from 11 pre-existing) — the two `confirm`
  `no-undef` errors in `UsersShowView.vue` are gone because that file no
  longer calls `confirm()`. The remaining 9 are unchanged/unrelated
  pre-existing issues (`PiniaConfig.ts` `localStorage`, `ChartGraphic.vue`
  `any`/`HTMLCanvasElement`, `SelectorFilter.vue` `Event`/`HTMLSelectElement`,
  `AccountsShowView.vue` `confirm` — that last one is untouched, out of
  scope here).
- Manual pass through `/transactions`, `/users`, `/reports` (filters, empty
  states, both themes): no visual or behavioral difference from `main`.
