# SERVICE-12: Implement TransactionService (CRUD & Filters)

## What was done

- Created `src/services/TransactionService.ts` with static methods for transaction operations (`getTransactions`, `getTransactionById`, `createTransaction`, `updateTransaction`, `deleteTransaction`, `filterByType`, `filterByAccount`, `filterByMonth`).
- Configured default descending date sorting inside `getTransactions()`.
- Implemented strict domain validation (`amount > 0`) and relational integrity checks (`accountId` and `activityId`) via `AccountService` and `ActivityService`.
- Applied string sanitization (`.trim()`) on input fields such as `description` and `monthKey`.
- Isolated transactions in `getTransactions()` so that only transactions associated with the active user's accounts are returned.
- Excluded monthly total aggregations following scope change #41 (delegated to `ReportService`).

## Decisions

### Why throw exceptions instead of returning error result objects?
`AccountService` and `ActivityService` establish a clear design pattern across the project where domain validation failures raise explicit `Error` instances (e.g. `throw new Error(...)`). `TransactionService` adopts this same error-handling strategy for architectural consistency across services.

### Why filter transactions using `AccountService.getAccounts()`?
`TransactionInterface` references `accountId` rather than `userId` directly. Mapping transactions against the set of account IDs returned by `AccountService.getAccounts()` ensures cross-user data isolation and enforces session ownership.

### Why use individual imports for `CreateTransactionDTO` and `UpdateTransactionDTO`?
Each DTO is structured as a dedicated file inside `src/dtos/` (`CreateTransactionDTO.ts` and `UpdateTransactionDTO.ts`). Importing them explicitly maintains clear file resolution and TypeScript compliance.

### Why validate relational integrity inside `TransactionService`?
Checking that referenced accounts and activities exist prior to persisting prevents orphan records and maintains data consistency across Pinia stores.

## Validation

- Type-checking verified using `npx vue-tsc --noEmit -p tsconfig.app.json`.
- Verified CRUD operations, `.trim()` sanitization, relational validations, and store persistence via interactive browser console testing.
- Formatted via `npm run format`.