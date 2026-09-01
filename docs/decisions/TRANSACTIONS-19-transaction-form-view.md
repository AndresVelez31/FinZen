# TRANSACTIONS-19: Implement TransactionFormView (Create & Edit modes)

## What was done

`TransactionFormView.vue` already existed with a complete, well-built UI (type toggle, amount field with currency prefix, account/activity selects, date, description, validation, actions) but was a legacy prototype importing from a nonexistent `@/store` module — it could not compile. This migrates it to the real architecture, following the same structure already established in `AccountFormView.vue` (#21).

## Decisions

### 1. Migrated to `View → Service → Store`, reusing the exact `AccountFormView.vue` shape
Replaced `import { myTransactions, myActivities, myAccounts, saveTransaction } from '@/store'` with `TransactionService`, `AccountService`, `ActivityService`, and the derived `CreateTransactionDTO`/`UpdateTransactionDTO`. `editing`/`transactionId` computeds, the `onMounted` prefill-or-redirect logic, and the `validate()` + `submit()` try/catch/finally shape all mirror `AccountFormView.vue` for consistency across the two form views.

### 2. Descriptive variable naming
The first draft copied `AccountFormView.vue`'s own `const e: FormErrors = {}` inside `validate()`, which is itself a single-letter name. Renamed to `validationErrors` per the naming convention established in `SERVICE-10-account-service.md`.

### 3. Business logic split: View validates for UX, Service validates for integrity
Per `GUIA_ARQUITECTURA...md` §13 and §47 ("Regla para formularios"), the View's `validate()` only covers UX-level required-field checks; `TransactionService.createTransaction`/`updateTransaction` remain the actual authority (amount > 0, account/activity existence) and throw on invalid data, caught by the View's `try/catch` to show a SweetAlert2 error. This is not duplicated business logic — the View isn't the only place integrity is enforced.

### 4. Removed a dead, no-op activity filter
The legacy version had `filteredActivities = ... myActivities.value.filter((a) => a.type === 'expense' || true)` — the `|| true` makes the filter always pass, so it was silently doing nothing. The domain model doesn't define an `'income'` `Activity.type` to filter against anyway (`Activity.type` is `'expense' | 'savings'` only), so there's no meaningful type-based filter to apply here. Removed the dead filter; the activity `<select>` now simply lists all of the user's activities.

### 5. `date` stored as a plain `YYYY-MM-DD` string
Matches `transactionseeder.ts`'s existing convention and the native `<input type="date">` output directly — no conversion needed.

## Validation

- `npx vue-tsc --noEmit` and `npx eslint` clean on `TransactionFormView.vue`.
- Verified end-to-end with a headless browser (logged in as admin):
  - Create mode: filled amount + description, submitted, got the "Transacción creada" success dialog.
  - Edit mode (`/transactions/1/edit`): fields pre-populated exactly from the seeded transaction (`amount: 185000`, `description: "Mercado semanal"`, `date: 2026-02-03`, account/activity resolved to their real names).
  - Invalid id (`/transactions/999999/edit`): the `router.replace({ name: 'transactions' })` redirect call fires correctly.

**Known limitation, out of scope for this issue:** the post-submit `router.push({ name: 'transactions' })` call executes correctly, but `TransactionsView.vue` (#18) is not yet migrated off the same legacy `@/store` module and currently fails to load (500 in dev), so the navigation cannot visibly complete until #18 is done. This is not a bug in `TransactionFormView.vue`.
