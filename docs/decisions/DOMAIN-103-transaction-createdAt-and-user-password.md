# DOMAIN-103: Remove `Transaction.createdAt`, require `User.password`, and align `userId` field order

## Status

Accepted

## Context

Reviewing the domain model surfaced two small inconsistencies:

1. **`TransactionInterface.createdAt`** duplicated `date`. For every other
   entity (`Account`, `Activity`, `User`), `createdAt` records when the
   record was inserted into the store, which is meaningfully different from
   any domain field. For `Transaction`, though, `date` *is* the moment the
   transaction is considered to have happened, and `TransactionService.create()`
   set both fields to `new Date().toISOString()` in the same call — `createdAt`
   never diverged from "now", and nothing in the app ever read it (sorting in
   `TransactionService.getAll()` uses `date`, not `createdAt`). Keeping it was
   dead state that only added noise to the seeder (80 identical lines).

   `updatedAt` is unaffected: it's a real audit field, set again by
   `TransactionService.update()`, and distinct from `date`.

2. **`UserInterface.password` was `password?: string`** (optional) since the
   very first commit that introduced the interface. Auditing every consumer:
   - `AuthService.login()` does `user.password !== password` — a missing
     password simply can never match, so optionality was never load-bearing.
   - The seeder always sets `password` for both demo users.
   - `CreateUserDTO`/`UpdateUserDTO` have no consumer yet (`UserService` only
     exposes `updateRole`/`toggleActive`).

   No code path ever constructs or relies on a `User` without a `password`.
   The optionality didn't reflect an actual use case — it was speculative slack
   inherited from the original scaffold.

3. **`AccountInterface`/`ActivityInterface`** had `userId` as the second
   field, ahead of the entity's own domain fields. `TransactionInterface`
   already grouped its foreign keys (`accountId`, `activityId`) at the bottom,
   after a blank line separating "what this record is" from "what it belongs
   to". Reordering `Account`/`Activity` the same way is a pure formatting
   change (no consumer reads these interfaces positionally) that makes the
   three entities consistent.

## Decision

- Remove `createdAt` from `TransactionInterface`. `CreateTransactionDTO` and
  `UpdateTransactionDTO` drop it from their `Omit<...>` (it's no longer a key
  on the interface to omit). `TransactionService.create()` no longer sets it.
  The seeder's 80 `createdAt: new Date().toISOString(),` lines are removed.
- Change `UserInterface.password` from `password?: string` to
  `password: string`. No DTO or call site needed changes — every existing
  user object already carried a password.
- Reorder `userId` to the end of `AccountInterface` and `ActivityInterface`
  (after a blank line), matching `TransactionInterface`'s
  `accountId`/`activityId` placement.

`Account`/`Activity`/`User` keep `createdAt` — this is scoped to `Transaction`
only, where `date` already carries that meaning.

## Consequences

- One less redundant field to seed, serialize, and reason about on
  `Transaction`.
- `User.password` now reflects actual usage: every `User` in the system has
  one. A future flow that legitimately needs a user without a local password
  (SSO, pending invite) should model that explicitly (e.g. a
  `passwordless: boolean` flag or a separate DTO), not by silently allowing
  `undefined`.
- `AccountInterface`/`ActivityInterface`/`TransactionInterface` now read
  consistently: domain fields first, foreign keys last.
- No consumer changes were needed beyond the interfaces/DTOs/service/seeder
  touched here — `npm run type-check`, `npm run build`, and
  `npm run lint:eslint` all pass with the same pre-existing 8-error ESLint
  baseline (`no-undef`/`no-explicit-any` config gaps, unrelated to this
  change).
