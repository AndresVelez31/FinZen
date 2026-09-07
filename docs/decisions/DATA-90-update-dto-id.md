# DATA-90: Make id required on Update DTOs, collapse update() to a single parameter

## What was done

- `UpdateAccountDTO`, `UpdateActivityDTO`, `UpdateTransactionDTO`, `UpdateUserDTO`:
  added `id: number` as a required field alongside the existing
  `Partial<Omit<...>>` shape:
  ```ts
  export type UpdateAccountDTO = Partial<Omit<AccountInterface, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> & {
    id: number;
  };
  ```
- `AccountService.update`, `ActivityService.update`, `TransactionService.update`:
  collapsed from `update(id, dto)` to a single-parameter `update(updateAccountDTO)`
  (and the `Activity`/`Transaction` equivalents), matching the type-specific
  parameter naming already used by `create()`. Each destructures
  `const { id, ...accountUpdates } = updateAccountDTO;` up front (`activityUpdates`/
  `transactionUpdates` for the other two), then uses that rest object everywhere
  the old code used `dto` (validation checks, the spread onto the existing
  record). `id` is only ever used to find the record, never spread onto it.
  `TransactionService.update` also renamed its local `txToUpdate` to
  `transactionToUpdate`, dropping the abbreviation.
- `AccountFormView.vue`, `ActivityFormView.vue`, `TransactionFormView.vue`:
  the DTO literal built in `submit()` now includes `id`, and the call site
  dropped the separate `id` argument (`AccountService.update(accountId, dto)`
  → `AccountService.update(dto)`, and the same shape for the other two).
- `UserService`: unchanged. It has no generic `update(id, dto)` today — only
  `updateRole(id, role)` and `toggleActive(id)` — so there was nothing to
  collapse. `UpdateUserDTO` still gets the `id`-required shape for consistency
  with the other three DTOs, but stays without a consumer.

## Decisions

### Destructure `id` out instead of just reading `dto.id`
`static update(updateAccountDTO) { const { id, ...accountUpdates } = updateAccountDTO; ... }`
instead of `static update(dto) { const id = dto.id; ... }`. The destructured
`accountUpdates` object no longer contains `id`, so
`{ ...accountToUpdate, ...accountUpdates }` can never accidentally overwrite
the existing record's `id` with itself via the spread — the intent (id
identifies the record, the rest of the DTO is what changes) is enforced by
the type of `accountUpdates`, not by convention.

### `UpdateUserDTO` gets the same treatment even without a consumer
Per [[finzen-domain-model-strict]]-adjacent reasoning already recorded in
`SERVICE-88`: `CreateUserDTO`/`UpdateUserDTO` are forward-looking for features
not built yet (user registration, self-service profile editing). Leaving
`UpdateUserDTO` on the old `Partial<Omit<...>>` shape while the other three
move to `id`-required would mean revisiting it a second time whenever that
future `UserService.update()` gets written. Updating it now, alongside its
three siblings, costs nothing and keeps the four DTOs consistent.

### No change to validation behavior
Every `if (accountUpdates.x !== undefined ...)` check is byte-for-byte the
same logic as the old `if (dto.x !== undefined ...)` — only the identifier
changed, since the destructured rest object needed its own name once `dto`
became the full DTO (including `id`) rather than just the fields to change.

## Validation

- `npm run type-check`: no errors.
- `npm run build`: succeeds, no new warnings.
- `npm run lint`: 11 pre-existing errors, identical count/lines to `main`;
  none related to this change.
