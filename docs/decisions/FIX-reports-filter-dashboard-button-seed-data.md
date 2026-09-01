# FIX: Reports filter, Dashboard "Nueva transacción" button, and richer seed data

## What was done

Three issues raised after comparing the current app against the original prototype (`06be02e`, the project's first commit) and its reference screenshots.

### 1. Reports period filter showed a broken 5th "Todos" option
`SelectorFilter.vue` unconditionally rendered a blank `<option value="">{{ props.placeholder || 'Todos' }}</option>`. `ReportsView.vue` passes `placeholder=""` for its period selector (intentionally, since all 4 period options are meaningful and there's no legitimate "no selection" state) — but `''` is falsy, so the fallback `'Todos'` kicked in anyway, adding an unwanted 5th option whose `value=""` didn't match any of `ReportService`'s date-range branches, silently behaving like "Mes actual" while being labeled "Todos".

**Fix:** the placeholder `<option>` is now conditional (`v-if="props.placeholder"`), so an empty string genuinely means "no placeholder option." `TransactionsView.vue` (4 selectors) and `UsersIndexView.vue` (1 selector), which all pass real placeholder text ("Todas", "Todos", "Todos los roles"), are unaffected — verified with a headless browser that all their options are unchanged.

### 2. Dashboard was missing the "Nueva transacción" button
The original prototype's dashboard had a primary "Nueva transacción" button in the header, navigating to `/transactions/new`. It was dropped somewhere during the `DASHBOARD-17` rebuild. Added back, following the same `router.push({ name: 'transaction-new' })` pattern already used elsewhere (`TransactionsView.vue`).

### 3. Seed data: the regular demo user had nothing
`accountSeeder`/`activitySeeder`/`transactionSeeder` only ever seeded data for `userId: 1` (Admin Demo). `user@finzen.app` (`userId: 2`, the account the README documents as a demo login) had zero accounts, zero activities, zero transactions — every page appeared empty for that user in exactly the workflow a reviewer is most likely to try.

**Fix:** added 4 accounts, 7 activities, and 40 transactions for `userId: 2`, mirroring the volume and 8-month spread (Feb–Sep 2026) already present for the admin user.

### 4. Found while populating data: `type: 'savings'` on transactions, and negative account balances
Two related pre-existing bugs surfaced while building the new seed data:

- 9 transactions used `type: 'savings'`, but `TransactionInterface.type` is only meant to be `'income' | 'expense'` (per `docs/domain-model.md` and how `ReportService.getMonthlyTotals`/`getExpensesByActivity` filter strictly on `'expense'`) — a contribution to a savings-type *activity* is still an outflow (`'expense'`) from the *account*; `Activity.type: 'savings'` is what marks the category as a savings goal. The original prototype's own seed data followed this correctly (`push("a2", "ac6", "expense", ...)` for every "aporte" entry). The 9 mistyped entries were silently excluded from every monthly/activity aggregation in `ReportService`, undercounting the charts. Fixed by changing all 9 to `'expense'`.
- Several accounts (admin's Nequi; all three of the new demo user's non-primary accounts) went **negative**, because all salary income was deposited into a single account while every other account only ever received expenses/savings contributions, with no offsetting income ever recorded against them. Fixed by raising those accounts' `balance` (which serves as the domain's `initialBalance` equivalent) enough to comfortably absorb their expense load without changing any transaction data.

## Validation

- `npx vue-tsc --noEmit`: 0 errors project-wide.
- `npx eslint`: no new errors introduced (the remaining ~13 are the pre-existing browser-globals config gap, tracked separately, untouched here).
- Verified with a headless browser, both as Admin Demo and the regular Usuario Demo:
  - `/reports`' period filter now shows exactly 4 options, each returning distinct, monotonically-increasing totals (current < 3m < 6m < all).
  - `TransactionsView.vue`'s 4 filters and `UsersIndexView.vue`'s role filter still show their placeholder option correctly.
  - Dashboard shows the "Nueva transacción" button for both users.
  - All 8 main pages load with zero console errors, for both users.
  - `/accounts` shows only positive balances for both users.
