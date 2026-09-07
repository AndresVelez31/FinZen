# SERVICE-88: Rename service methods so they don't repeat the entity name

## What was done

- Renamed every CRUD-shaped method across the four domain services to a plain
  verb, since the class name already gives the entity context:
  - `AccountService`: `getAccounts→getAll`, `getAccountById→getById`,
    `createAccount→create`, `updateAccount→update`, `deleteAccount→delete`,
    `getAccountBalance→getBalance`.
  - `ActivityService`: `getActivities→getAll`, `getActivityById→getById`,
    `createActivity→create`, `updateActivity→update`, `deleteActivity→delete`.
  - `TransactionService`: `getTransactions→getAll`, `getTransactionById→getById`,
    `createTransaction→create`, `updateTransaction→update`,
    `deleteTransaction→delete`.
  - `UserService`: `getUsers→getAll`, `getUserById→getById`,
    `updateUserRole→updateRole`, `toggleUserActive→toggleActive`,
    `getCurrentUser→getCurrent`.
- Updated every call site: the internal self-calls inside each service
  (`this.getAccountById` → `this.getById`, etc.), `src/utils/ReportService.ts`,
  `src/router/index.ts`, `src/components/layout/AppLayout.vue`, and all 10 views
  in `src/views/`.
- Left unchanged: `AccountService.getTotalBalance`, `UserService.login`,
  `UserService.logout`, `UserService.isAuthenticated` — none of them repeat the
  entity name. `TransactionService.filterByType/filterByAccount/filterByMonth`
  were also left as-is: they're unused dead code today (no view calls them),
  and consolidating/removing them is out of scope for a naming-only change.
- Removed the one-line JSDoc on the five renamed CRUD methods per service
  (`getAll`, `getById`, `create`, `update`, `delete`) where the comment only
  restated the method name (e.g. `/** Retrieves a specific account by its ID. */`
  above `getById`). Kept JSDoc that explains something not obvious from the
  signature: `AccountService.getBalance`/`getTotalBalance`,
  `TransactionService.filterByType/filterByAccount/filterByMonth`, and every
  comment in `ReportService.ts`.
- Renamed the `create()` parameter from the generic `dto` to a type-specific
  name in all three creatable entities: `AccountService.create(createAccountDTO)`,
  `ActivityService.create(createActivityDTO)`,
  `TransactionService.create(createTransactionDTO)`. Left `update()`'s `dto`
  parameter alone in all three, since its shape changes in the very next issue
  (making `id` a required field of the Update DTO) — renaming it now would just
  mean renaming it again immediately after.
- Replaced every non-descriptive single/two-letter identifier in the touched
  views and in `ChartGraphic.vue` with a descriptive name: callback/comparator
  parameters (`u→user`, `a→account`/`activity`, `t→transaction`, `s/e→word`/
  `entry`, sort comparators `(a,b)→(currentEntry, nextEntry)` /
  `(currentYear, nextYear)` / `(currentTransaction, nextTransaction)`), and a
  local variable (`c→colors` in `ChartGraphic.vue`'s `baseOptions()`).

## Decisions

### Pure rename plus targeted identifier cleanup, zero behavior change
No signature (beyond the `dto` parameter renames, which are cosmetic — the
type and position are unchanged) and no logic was touched. Every change is
either a method name, a parameter name, a local variable name, or a comment
that restated a now-renamed method.

### Why verb-only instead of a repository-style rename (`findAll`/`save`/`remove`)
Both read the same once the class name is in scope
(`AccountService.getAll()` vs. `AccountService.findAll()`). `get/create/update/delete`
already matches the vocabulary used everywhere else in this codebase (DTOs are
`Create*DTO`/`Update*DTO`, not `Save*DTO`), so it's the smaller, more consistent
change.

### `UserService.updateUserRole`/`toggleUserActive` become `updateRole`/`toggleActive`, not `update`
`UserService` has no generic `update(id, dto)` — role changes and the active
toggle are two distinct, narrow operations, not a general update. Renaming both
to a single `update` would have collapsed two different behaviors under one
name. Each keeps its own verb, just without the redundant `User`.

### Why the JSDoc removal is bundled into this PR instead of the later comment-cleanup pass
The five one-line JSDoc comments removed here exist *only* because of the
method names being renamed here — `/** Retrieves a specific account by its ID. */`
stops adding anything the moment the method is called `getById`. Fixing it in
this same change avoids re-touching every one of these methods a second time
in the dedicated comment-cleanup issue. Comments that explain non-obvious
behavior (cascading deletes, balance calculation assumptions, why transactions
scope through account ownership) were deliberately left untouched — that
distinction is out of scope here and belongs to the comment-cleanup issue.

## Validation

- `npm run type-check`: no errors.
- `npm run build`: succeeds, no new warnings.
- `npm run lint`: 11 pre-existing errors reported (`PiniaConfig.ts` `localStorage`
  no-undef ×3, `ChartGraphic.vue` no-explicit-any ×2 + `HTMLCanvasElement`
  no-undef, `SelectorFilter.vue` `Event`/`HTMLSelectElement` no-undef,
  `AccountsShowView.vue`/`UsersShowView.vue` `confirm` no-undef ×3) — verified
  identical count and identical lines on `main` before this change; none are
  related to the renamed methods, their call sites, or the identifier cleanup.
