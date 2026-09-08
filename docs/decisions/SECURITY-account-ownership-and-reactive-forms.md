# SECURITY: Scope Account/Activity/Transaction services to the current user, complete the business-logic extraction, reopen route-param reactivity

## What was done

### Ownership fix (originated from reviewing @Salazar1022's PR #96)
While reviewing PR #96 (`refactor/views-structure` — based on an outdated
point in history, in conflict with `main`), a real bug surfaced:
`AccountService.getById`/`update`/`delete` never checked that the account
belonged to the current user. Any authenticated user could load, edit, or
delete another user's account by guessing its id in the URL
(e.g. `/accounts/7/edit`). Fixed here, and extended to the two sibling
services with the same shape:

- `AccountService`/`ActivityService`: `getById` now filters on
  `id === requestedId && userId === currentUserId`; `update`/`delete` use
  the same ownership-scoped lookup before touching the store.
- `TransactionService`: transactions have no direct `userId`, so `getById`
  now checks that the transaction's `accountId` resolves through the
  (now ownership-scoped) `AccountService.getById` — a transaction whose
  account belongs to someone else resolves to `undefined`, closing the same
  gap without duplicating `currentUserId` logic. `update`/`delete` reuse
  `getById` for the same check. As a side effect, reassigning a transaction
  to another user's account during an update is now also rejected (the
  existing "account does not exist" check already re-validates the new
  `accountId` through the same ownership-scoped lookup).
- `AccountService.create`/`update` also validate `balance >= 0`, matching
  the validation the View already had for UX but that the Service — where
  integrity validation belongs — was missing.
- Removed an unrelated pre-existing unused `useUserStore` import from
  `TransactionService.ts`, found while editing the file.

### Not adopted from PR #96
- Sebastián's `AccountType` union type (`'Corriente' | 'Ahorros' | ...`)
  replacing `Account.type: string` — declined; `type` stays `string`.
- Moving `ReportService`/`ReportAnalytics` back to `src/services/` —
  declined; it stays in `utils/` per `UTILS-81` and this session's
  `ReportAnalytics` rename. His version of that file was also based on
  pre-`SERVICE-88` method names (`ActivityService.getActivities()`) and its
  new methods (`getCumulativeBalanceByYear`, `getBudgetExecution`,
  `getSavingsProgress`) are superseded by equivalent, already-shipped
  methods on `ReportAnalytics`.
- His `AccountFormView.vue` template had a genuine syntax bug
  (`<button type="submit" class="btn btn-primary"> :disabled="saving">` —
  the attribute landed outside the tag as literal text) and
  `DashboardView.vue` called `AccountService.getBalance()` with no
  argument where `getTotalBalance()` was meant — both artifacts of an
  in-progress rename on his branch, not present here.

### Route params go back to `computed()` + `watch()` — reopens `FIX-routes-params-const`
`FIX-routes-params-const` (PR #87) deliberately chose plain `const` for
`editing`/`:id` in all three form views, reasoning that Vue Router reuses a
component instance between two routes of the same component, and today's
navigation never goes directly from one edit URL to another (list → edit →
submit → redirect to list → edit again always remounts). That reasoning was
correct for the navigation that existed then. This ADR reopens it: at the
user's explicit request, `AccountFormView.vue`, `ActivityFormView.vue`, and
`TransactionFormView.vue` now read `editing`/`:id` as `computed()` and use
`watch([editing, id], loadForm, { immediate: true })` to reload the form
whenever the route changes — making the components correct if such
navigation is ever added, at the cost of the small amount of complexity
`FIX-routes-params-const` had avoided. All three forms move together, so
they stay consistent with each other (unlike PR #96, which only touched
one). `FIX-routes-params-const` itself is left unedited, per this project's
append-only-ADR convention; this decision supersedes it going forward.

Each form's `loadForm()` also now surfaces a failed `update()` as an error
dialog instead of silently doing nothing — a real gap the ownership check
opened, since `update()` can now return `undefined` for a legitimate reason
(the record isn't yours) and not just a not-found edge case.

### Completing PR 3 (`REFACTOR-94`) for `DashboardView.vue` and `ActivitiesShowView.vue`
`REFACTOR-94` deliberately excluded these two views to keep that PR's scope
to a named list of files. With that constraint lifted:

- `DateRange.ts` gained `currentMonthFull()` (day 1 through the month's last
  day — what `DashboardView` needs) and `currentMonthToDate()` (day 1
  through today — what `ActivitiesShowView` needs). These are genuinely
  different ranges, not interchangeable — see the fidelity note this was
  already flagged with during PR 4's planning.
- `ReportAnalytics.getActivityProgress()` (new): budgets (`type: 'expense'`)
  measured against the current month to date, savings goals measured
  all-time — the same domain rule that lived as a comment in
  `ActivitiesShowView.vue`, now moved with the logic it explains.
  `ActivitiesShowView.vue`'s `cards` computed collapses to one call;
  `monthStart`/`monthEnd`/`monthlyExpenses`/`allTimeExpenses`/the local
  `ActivityCard` interface are all gone.
- `DashboardView.vue`'s `donut` now calls
  `ReportAnalytics.aggregateExpensesByActivity(monthTransactions.value)` —
  the exact same method `TransactionsShowView.bar` already uses, so this
  aggregation is no longer duplicated between the two views. `monthSummary`
  (`ReportAnalytics.summarize(...)`) replaces the two separate
  `monthExpenseTotal`/`monthIncomeTotal` reduce computeds. `monthExpenses`/
  `monthIncomes` stay as plain filters — they're only used for `.length`
  counts in the KPI trend text, not aggregation.
- `Formatters.initials(name)` (new): the exact same split/slice/map/join
  logic was duplicated between `UsersTable.vue`'s local `initials()` and
  `AppLayout.vue`'s `userInitials` computed. Both now call
  `Formatters.initials()`. `AppLayout`'s `?? '?'` fallback for a missing
  user is preserved.

## Decisions

### `currentMonthFull` vs `currentMonthToDate` are not merged into one function
Dashboard's KPI/donut include the whole current month, including dates later
in the month that haven't happened yet (matches `date.slice(0,7) ===
currentMonth`, the original inline check). Activities' budget progress bars
only count what's happened up to today. Collapsing these into a single
"current month" helper would silently change one view's behavior — kept as
two explicit, named methods instead.

### `getActivityProgress()` stays on `ReportAnalytics`, not `ActivityService`
`ReportAnalytics` already imports `ActivityService`. Putting this method on
`ActivityService` instead would require `ActivityService` to import
`ReportAnalytics` back, a circular import between the two files.

### `monthTransactions`/`monthExpenses`/`monthIncomes` stay in the view, not folded into one service call
`aggregateExpensesByActivity` and `summarize` both take a transaction array
and do their own internal type filtering — the view still needs
`monthExpenses.length`/`monthIncomes.length` for the KPI card subtext
("N movimientos"), which isn't something either method returns. Adding a
`count`-returning variant for two call sites reading a `.length` wasn't
worth a new method.

## Validation

- `npm run type-check`: no errors.
- `npm run build`: succeeds, no new warnings.
- `npm run lint`: 8 errors (down from 9) — the `AccountsShowView.vue`
  `confirm` `no-undef` error is gone (also replaced with SweetAlert2 while
  in this file, matching the same destructive-action styling already used
  elsewhere). Zero `confirm()` calls remain anywhere in the app. Remaining
  8 are unrelated pre-existing issues (`PiniaConfig.ts` `localStorage`,
  `ChartGraphic.vue` `any`/`HTMLCanvasElement`, `SelectorFilter.vue`
  `Event`/`HTMLSelectElement`).
- Manual pass through `/`, `/activities`, `/accounts`, the three form views,
  and a direct cross-user access attempt (editing another seeded user's
  account/activity/transaction id via URL): the record is now treated as
  not found instead of leaking or being editable, and every other flow is
  visually and behaviorally unchanged from `main`.
