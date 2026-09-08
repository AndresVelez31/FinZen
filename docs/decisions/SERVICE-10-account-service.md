# SERVICE-10: Implement AccountService

> Historical note: this decision started with basic validation inside each mutation method.
> The amendment below records the current centralized validation, canonical type catalogue, and
> user-ownership rules.

## What was done

- Created `src/services/AccountService.ts` containing strictly static methods.
- Implemented `getAccountTypes()`, `getAccounts()`, `getAccountById()`,
  `validateAccountData()`, `createAccount()`, `updateAccount()`, and `deleteAccount()`.
- Centralized account validation and name sanitization so the same rules protect both creation and
  update mutations.
- Implemented `getAccountBalance()` computing balance via the stored `balance` plus/minus associated transactions.
- Implemented `getTotalBalance()` by iterating all active user accounts.
- Scoped account reads, updates, balance calculations, and deletions to the active user.

## Decisions

### 1. Static Method Pattern

Following the `UserService` implementation, all methods are static. This groups the domain rules into a single namespace without needing instantiation, making it easy to call from components or other services.

### 2. Descriptive Variable Names

In accordance with `docs/wiki/Programming-Rules.md`, single-letter variables like `a` or `t` were expanded to `account` and `transaction` within `.filter()` and `.reduce()` arrays, making the logic much more readable.

### 3. ID Generation (Updated)

For `createAccount()`, IDs are generated numerically using `Date.now()` to strictly comply with the domain model (which enforces `id: number` and rejects UUID strings). Timestamps (`createdAt` and `updatedAt`) are also correctly assigned.

### 4. Balance Calculation Logic

`getAccountBalance(id)` calculates `balance + Σincome - Σexpenses`. Any transaction where `type === 'income'` adds to the current balance, while any other transaction type (such as `expense` or `savings`) subtracts from it.

### 5. Cascade Deletion

`deleteAccount(id)` removes the account from the account store and all transactions tied to that
`accountId`. Before either collection is mutated, the method resolves the account through the
user-scoped `getAccountById()`. An absent account, an absent session, or an account owned by another
user therefore produces a no-op and cannot trigger a cross-user cascade.

## Amendment: Centralized Validation and User Scope

This amendment supersedes the original description of validation as separate, basic checks inside
the mutation methods.

### 1. Canonical Account Type Catalogue

`AccountType` is the strict union used by `AccountInterface`, and `AccountService` owns the runtime
catalogue exposed through `getAccountTypes()`:

```text
Corriente
Ahorros
Efectivo
Digital
Inversión
```

The returned collection is read-only. Consumers may attach labels, icons, or other presentation
metadata, but they do not define which values are valid domain account types.

### 2. One Validation Path for Create and Update

`validateAccountData(dto)` is a state-independent operation: it does not read or mutate a Pinia
store. It validates a complete `CreateAccountDTO` and returns a discriminated
`AccountValidationResultDTO`.

For valid data, the result contains a sanitized `value`; in particular, `name` has been trimmed.
For invalid data, it contains typed issues composed of a field and one of these codes:

```text
NAME_REQUIRED
TYPE_REQUIRED
TYPE_INVALID
BALANCE_INVALID
BALANCE_NEGATIVE
```

The balance must be a finite number greater than or equal to zero, and the type must belong to the
canonical catalogue. No mutation occurs as part of validation.

`createAccount()` sends its DTO through the private `getValidAccountData()` guard before inserting
it. `updateAccount()` first combines the partial `UpdateAccountDTO` with the stored account, then
sends that complete candidate through the same guard. As a result, callers cannot bypass the rules
by invoking a mutation method directly. Mutation methods continue to throw an `Error` when invalid
data reaches this defensive guard.

### 3. Validation Codes and Presentation Messages

The public validation contract communicates field failures with typed codes rather than localized
copy. `AccountFormView` maps those codes to Spanish field messages and decides how to render them.
This keeps presentation wording and form state in the View while the rules and sanitization remain
in the Service.

### 4. Active-User Ownership Boundary

Account ownership is enforced in the Service, not inferred by a View:

- `getAccounts()` returns only accounts whose `userId` matches `currentUserId`.
- `getAccountById()` returns `undefined` without an active session and for both an unknown ID and
  an ID owned by another user.
- `createAccount()` requires an active session and assigns its `currentUserId`; otherwise it throws.
- `updateAccount()` requires an active session and searches by both account ID and owner. It returns
  `undefined` when the account is absent or belongs to another user.
- `deleteAccount()` uses the scoped lookup as its guard, so an unavailable account is a no-op and
  its transactions remain untouched.
- `getAccountBalance()` returns `0` for an account unavailable to the active user, while
  `getTotalBalance()` aggregates only the scoped account collection.

Treating an unknown account and a foreign account alike prevents account data from leaking through
service return values.

## Validation

- Targeted `vue-tsc` validation for the modified account files passes.
- Targeted ESLint and OXLint checks for the modified account files pass.
