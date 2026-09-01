# ADMIN-22: Implement ActivitiesIndexView (Admin-only Category CRUD)

## What was done

- Renamed `ActivitiesView.vue` to `ActivitiesIndexView.vue`, matching the RESTful naming convention already used by `AccountsIndexView.vue` and the naming table in `docs/wiki/Coding-Style-Guide.md`.
- Migrated it from the legacy `@/store` module to `ActivityService` + the derived DTOs.
- Replaced the card-grid layout with `GenericTable`, per the issue's explicit acceptance criterion (`AccountsIndexView.vue` uses a card grid instead, so it wasn't followed as the layout precedent here — `UsersIndexView.vue` was, since it already uses `GenericTable` correctly).
- Updated `router/index.ts`'s `/activities` route to import the renamed file.

## Decisions

### 1. Kept the existing modal-based create/edit UI
The legacy view already had a well-built modal (name, expense/savings type toggle, target amount, color swatch picker) — the issue allows "inline form or modal," so the modal was kept and migrated rather than rebuilt from scratch. `reactive()` was replaced with a typed `ref()` object to match the convention used by `AccountFormView.vue`/`TransactionFormView.vue`.

### 2. `GenericTable` with cell slots, same pattern as `UsersIndexView.vue`
`GenericTable`'s `rows` prop is untyped (plain `Array`), so a local `asActivity(row: unknown): ActivityInterface` cast helper is used inside cell slots — mirrors `UsersIndexView.vue`'s `asUser()` helper exactly, for consistency across the two admin table views.

### 3. Dropped the "amount used/spent" progress bar
The legacy card view computed `spentThisMonth`/`savedTotal` per activity by reading `myTransactions` directly and filtering by `monthKey()`. The issue's acceptance criteria only ask to display `targetAmount` ("target budget/savings"), not progress against it — and that aggregation already exists as `ReportService.getExpensesByActivity()`. Recomputing it here would duplicate that logic in a second place for a feature the issue didn't request, so it was dropped rather than ported.

### 4. Router guard reused, no per-view auth check
The `/activities` route already carries `meta.admin: true`, and `router/index.ts`'s global `beforeEach` guard already redirects non-admins to `/dashboard`. No additional guard logic was added inside the view itself — duplicating that check per-view is exactly what the shared guard exists to avoid (`docs/wiki/Programming-Rules.md` §1: "Administrative routes must enforce role guards").

### 5. Imported `formatToCOP` from `utils/formatters.js` instead of redefining it
`AccountsIndexView.vue` (merged earlier, #52) has its own local `formatToCOP` function duplicating the exact same `Intl.NumberFormat` logic already in `utils/formatters.ts`. That duplication was not repeated here — this view imports the shared utility directly.

## Validation

- `npx vue-tsc --noEmit` and `npx eslint` clean on `ActivitiesIndexView.vue` and `router/index.ts`.
- Verified end-to-end with a headless browser (admin session): table renders all seeded activities with correct color dots, type badges, and formatted amounts; create → edit (fields prefilled) → delete flow works with SweetAlert2 confirmations; zero console errors.
- Verified the role guard: logging in as the regular demo user and navigating to `/activities` redirects to `/` (dashboard).
