# ACCOUNTS-21: Implement AccountFormView (Create & Edit modes)

## What was done

- Created `src/views/AccountFormView.vue` to replace the legacy version, which imported
  from the deleted `@/store` module and used the pre-refactor `bank` / `accountNumber` /
  `initialBalance` fields.
- Create mode (`/accounts/new`): renders a blank form and calls
  `AccountService.createAccount(dto)` with a `CreateAccountDTO`.
- Edit mode (`/accounts/:id/edit`): resolves the account via
  `AccountService.getAccountById(id)` in `onMounted`, pre-fills the form, and calls
  `AccountService.updateAccount(id, dto)` with an `UpdateAccountDTO`. If the id doesn't
  resolve to an existing account, redirects to `/accounts` (same guard pattern already
  used in `TransactionFormView.vue`).
- Client-side validation: `name` required, `type` required, `balance` must be a valid
  number `>= 0`.
- Wraps the `AccountService` call in `try/catch`, since `createAccount`/`updateAccount`
  throw on invalid domain state (e.g. missing name); shows a SweetAlert2 success or
  error dialog accordingly, then redirects to `/accounts` on success.
- Cancel button routes back to `/accounts` via the named route, not a hardcoded path.

## Decisions

### The issue's original field list (`bank`, `account number`, `initial balance`) is outdated
The acceptance criteria were written before `PR #38` (`refactor/domain-alignment`,
merged the same day) changed `AccountInterface` to `{ name, type, balance }` and
removed `accountNumber` entirely. Confirmed directly with the architect
(`AndresVelez31`) that this removal was intentional and permanent, not an oversight.
The form was built against the **current** interface: a single `name` field (replacing
"bank name"), `type`, and `balance` (used as the account's initial balance baseline —
`AccountService.getAccountBalance()` adds transaction deltas on top of it).

### `balance >= 0` is validated in the view, not in `AccountService`
`AccountService.createAccount()` currently only validates `name` and `type`; it does
not reject a negative `balance`. Rather than editing a shared service file outside this
issue's scope (and risking a conflict with whoever owns `AccountService`/`SERVICE-xx`
for accounts), the `>= 0` check required by this issue's acceptance criteria is
enforced client-side in `AccountFormView.vue`'s `validate()`. Worth flagging to the
team: `AccountService` could reject a negative balance too, for defense-in-depth.

### Errors are caught, not left to propagate
Unlike `UserService.login()` (which returns a `{ ok, error }` union),
`AccountService.createAccount()` / `updateAccount()` `throw` on invalid state. The view
wraps both calls in `try/catch` and surfaces `error.message` via a SweetAlert2 error
dialog, keeping the two different service-layer error conventions from leaking
inconsistent behavior into the UI.

## Validation

- `npx vue-tsc --noEmit`, scoped to `AccountFormView.vue`, reports no errors.
- `npm run lint` passes for `AccountFormView.vue`; the 7 errors currently reported by
  `npm run lint` are pre-existing, in files untouched by this issue (`PiniaConfig.ts`'s
  `localStorage` gap, `AppLayout.vue`, `SelectorFiltro.vue`).
- `AccountsView.vue` (the entry point to `/accounts`) is still on the legacy `@/store`
  module and out of scope for this issue, so the create/edit flow could not be
  exercised end-to-end through the UI. Verified manually instead via direct
  `AccountService` calls in the browser console (create, then `getAccountById` /
  `getAccounts` to confirm persistence in `localStorage`).