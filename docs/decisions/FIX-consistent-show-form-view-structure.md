# FIX: Consistent Show/Form view structure across all CRUD entities

## What was done

Every entity with full CRUD in FinZen must have exactly two views: `<Entity>ShowView.vue` (lists all) and `<Entity>FormView.vue` (create/edit, shared for both modes). Two inconsistencies were found and fixed:

1. **Naming**: `TransactionsView.vue` was missing the suffix used by every other list view (`AccountsIndexView.vue`, `ActivitiesIndexView.vue`, `UsersIndexView.vue`).
2. **Structure**: `ActivitiesIndexView.vue` had no separate form view — create/edit lived in an inline modal within the list view, unlike Accounts and Transactions, which already navigate to a dedicated routed form.

## Decisions

### 1. `Show`, not `Index` — a deliberate, documented naming override

Standard REST convention (and what `GUIA_ARQUITECTURA...md` §19 originally documented, copied from generic course tutorials) uses `Index` for "list all" and `Show` for one specific item's detail page. For this project, the convention is inverted on purpose: `Show` = list all, `Index` would mean one specific item (not used anywhere in FinZen — no entity has an individual read-only detail page; editing happens via the Form, browsing via the list).

All 4 list views were renamed accordingly:

```
TransactionsView.vue    → TransactionsShowView.vue
AccountsIndexView.vue   → AccountsShowView.vue
ActivitiesIndexView.vue → ActivitiesShowView.vue
UsersIndexView.vue      → UsersShowView.vue
```

`GUIA_ARQUITECTURA_CODIGO_LIMPIO_METODOLOGIA.md` (§19.1, new), `docs/wiki/Coding-Style-Guide.md`, and `docs/wiki/Programming-Rules.md` were updated first, per the project's own rule that documentation is updated before the code it governs when the two are found to disagree. Historical ADRs (`ACCOUNTS-20`, `ADMIN-22`, `ADMIN-23`, `COMPONENT-25`, `COMPONENT-28`, the earlier `FIX-*` records) were **not** rewritten — they're an append-only record of what was true when each was written, not living documentation.

### 2. `ActivityFormView.vue` extracted from `ActivitiesShowView.vue`'s modal

The modal's fields (name, expense/savings type toggle, target amount, color picker) and its `validate`/`submit` logic were moved into a new routed view, styled to match `AccountFormView.vue`/`TransactionFormView.vue`'s page layout (`.form-page`, `.back` link, `.card.form`, `.actions`) rather than the modal chrome. New routes:

```
/activities/new       → activity-new  → ActivityFormView.vue (create)
/activities/:id/edit  → activity-edit → ActivityFormView.vue (edit)
```

`activity-edit` was added to `router/index.ts`'s `ROUTES_REQUIRING_ID` map, matching `transaction-edit`/`account-edit`. `ActivitiesShowView.vue` lost all its modal state (`showModal`, `editingId`, `form`, `errors`, `saving`, `openNew`, `openEdit`, `validate`, `save`) and now just `router.push`es to the new routes; `remove()` (delete) stays inline, matching the existing pattern in `AccountsShowView.vue`/`TransactionsShowView.vue` where delete is also inline, not a separate view.

### 3. `UsersShowView.vue` is the one entity without a Form

Users has no create/delete UI — only inline role-switch and active/inactive toggle actions on the table, matching the original prototype's design. Since there's no "create a user" flow to extract, `UsersShowView.vue` correctly has no `UserFormView.vue` counterpart; this isn't an inconsistency, it's a different (smaller) CRUD shape by design.

### 4. `GenericTable.vue`/`StatCard.vue` type fixes surfaced by the renames

Running the project's real type-check command (`npm run type-check`, i.e. `vue-tsc --build` — not a bare `vue-tsc --noEmit`, which silently misses errors this build catches) surfaced pre-existing issues that the renamed/retyped views made visible:

- **`GenericTable.vue`**: its `rows` prop was typed `TableRow[]` with an inline `[key: string]: unknown` index signature. TypeScript never lets a named interface without its own index signature (`TransactionInterface`, `UserInterface`) satisfy that shape, even when every field matches — so `TransactionsShowView.vue`/`UsersShowView.vue` failed to compile while `ReportsView.vue`'s anonymous-object rows didn't. Fixed by loosening `rows` to `unknown[]` (documented inline) and adding an internal `asRow()` cast helper for the template's row/cell access; each consuming view already casts rows to its own domain type inside cell/action slots via its own `asX()` helper, so nothing downstream lost type safety. This also means slot-scoped `row` is now `unknown` at the call site — `DashboardView.vue`'s `#cell-amount` and `ReportsView.vue`'s `#cell-name` slots were updated to cast it (`asTx()`, `asSummaryRow()`) instead of accessing properties directly.
- **`StatCard.vue`**: `withDefaults` explicitly defaulted the optional `icon`/`trend` props to `undefined`, which `exactOptionalPropertyTypes: true` rejects. Removed both keys from the defaults object — omitted optional props are already `undefined` without declaring it.
- **Untyped `columns` array literals**: `DashboardView.vue`, `ReportsView.vue`, `TransactionsShowView.vue`, `UsersShowView.vue` each declared `columns`/`summaryColumns` as a plain `const`, which widens `align: 'right'` to `string` when only some entries set it, breaking `TableColumn['align']`. Fixed by exporting `TableColumn` from `GenericTable.vue` and annotating each array `: TableColumn[]`.
- **`UsersShowView.vue` missing `loading` ref**: the template bound `:loading="loading"` on `<GenericTable>` but no `loading` ref was ever declared — a genuine bug, not just a type nuisance. Added the same `loading` skeleton pattern already used by `ActivitiesShowView.vue`/`AccountsShowView.vue`/`TransactionsShowView.vue` (`ref(true)` cleared via `onMounted`/`setTimeout`).

## Validation

- `npm run type-check` (`vue-tsc --build`, the project's real command): 0 errors project-wide.
- `npx eslint`: clean on all touched files. The only remaining `no-undef` warning on `confirm(...)` in `UsersShowView.vue` is pre-existing (present in `UsersIndexView.vue` before this rename) and out of scope for this fix.
- Verified with a headless browser: `/activities/new` and `/activities/:id/edit` render and submit correctly (create success dialog, edit pre-fills from the real activity); an invalid `:id` redirects to `/activities`; both the header "Nueva actividad" button and each card's edit icon navigate to the correct routes; `/users` loads its skeleton then real rows with the `loading` ref now wired up; full 8-page smoke test shows zero console errors.
- Confirmed no remaining `IndexView` references in `frontend/src/` (`grep -r`); historical ADRs intentionally left referencing the old names.
