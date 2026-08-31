# SERVICE-10: Implement AccountService

## What was done

- Created `src/services/AccountService.ts` containing strictly static methods.
- Implemented `getAccounts()`, `getAccountById()`, `createAccount()`, `updateAccount()`, `deleteAccount()`.
- Added basic input validation directly in the service methods (e.g. trimming names, checking required fields).
- Implemented `getAccountBalance()` computing balance via the stored `balance` plus/minus associated transactions.
- Implemented `getTotalBalance()` by iterating all active user accounts.

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
`deleteAccount(id)` not only removes the account from the account store but also removes all transactions tied to that `accountId` from the transaction store. This keeps data consistent and prevents orphaned transactions.

## Validation

- Verified that variables use descriptive names (no `a` or `t`).
- `npm run type-check` passes cleanly for the new service.
