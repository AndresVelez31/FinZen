# ROUTER-98: Match the required router format — eager imports, inline routes, dot-notation route names

## What was done

- `src/router/index.ts`: every view component is now imported eagerly at
  the top of the file (`import DashboardView from '@/views/DashboardView.vue'`)
  instead of lazily (`component: () => import('@/views/DashboardView.vue')`).
  The `routes` array moved from a separate `const routes: RouteRecordRaw[]`
  declared above `createRouter(...)` to being defined inline inside the
  `createRouter({ history, routes: [...] })` call — matching the exact shape
  of the format the course requires.
- Route names for the three create/edit form pairs moved to dot notation,
  matching that format's `books.create` pattern:
  `transaction-new`/`transaction-edit` → `transactions.create`/`transactions.edit`;
  `account-new`/`account-edit` → `accounts.create`/`accounts.edit`;
  `activity-new`/`activity-edit` → `activities.create`/`activities.edit`.
  Updated all 8 call sites across `DashboardView.vue`,
  `TransactionsShowView.vue`, `TransactionFormView.vue`,
  `AccountFormView.vue`, `ActivitiesShowView.vue` (×3),
  `ActivityFormView.vue`, and `ROUTES_REQUIRING_ID` in the router itself.
- `RouteMeta` type augmentation, `ROUTES_REQUIRING_ID`, and the full
  `beforeEach` guard (title, `:id` validation, auth redirect, admin
  redirect) are unchanged in behavior — only updated to reference the new
  route names.

## Decisions

### Index/page-level route names are unchanged
`login`, `dashboard`, `transactions`, `accounts`, `reports`, `activities`,
`users` keep their current names. The required format's own example
(`home`, `about`, `books`) doesn't establish a resource-vs-page pattern for
these — `books.create` is a sub-action of the `books` resource, but
`dashboard` isn't a resource with sub-actions, it's a page. Only the
create/edit pairs — which *are* sub-actions of a resource, the same shape as
`books.create` — moved to dot notation.

### URL paths are unchanged
The required format's path for its create example is `/books/create`,
mirroring the dot in `books.create`. FinZen's paths (`/accounts/new`,
`/accounts/:id/edit`) don't mirror the route *name* the same way today
either (path says "new", name said "account-new" before this change) — the
required format's own literal example wasn't followed for the path segment,
only for the route `name`, since path changes are a larger, unrelated
concern (bookmarks, direct links) that wasn't part of what was asked.

### Eager imports — the initial bundle grows substantially
This is a real, measured trade-off, not a minor stylistic change. Before:
each view was its own lazy chunk, loaded only when its route was visited
(`ChartGraphic` 204 kB and `ReportsView` 933 kB, for example, were separate
chunks that never loaded unless the user opened Reports). After: a single
`index.js` of **1.32 MB** (398 kB gzipped) — every view, Chart.js, and
ApexCharts load on the very first page hit, regardless of which route the
user lands on. Adopted anyway because eager imports are what the required
router format explicitly shows. If the app grows further and this becomes a
real problem, revisiting it (e.g. lazy-loading only the heaviest views,
`ReportsView`/`ChartGraphic`) is a decision for a future ADR, not implied by
this one.

### Guards, `RouteMeta`, and `ROUTES_REQUIRING_ID` are kept
The required format is a minimal example (a `Home`/`About`/`Books` demo app
with no authentication) — it doesn't show guards because that example has
none to show, not because guards are disallowed. FinZen's login gate and
admin-only routes are a hard requirement independent of this formatting
change, so the entire `beforeEach` block, its supporting `ROUTES_REQUIRING_ID`
map, and the `RouteMeta` type augmentation are preserved as-is.

## Validation

- `npm run type-check`: no errors.
- `npm run build`: succeeds. Bundle changed from many small per-route chunks
  to one 1.32 MB (398 kB gzipped) `index.js` plus `sweetalert2`/`apexcharts`
  (both still dynamically imported independently of routing —
  `sweetalert2` via `await import('sweetalert2')` inside action handlers,
  `apexcharts` as `RadialProgress.vue`'s own dependency, neither tied to
  route-level code-splitting).
- `npm run lint`: 8 pre-existing errors, identical count/lines to `main`;
  none related to this change.
- Manual pass through all 13 routes (login, dashboard, transactions ×3,
  accounts ×3, reports, activities ×3, users): navigation, the `:id`
  fallback redirect, the auth redirect, and the admin redirect all still
  work with the renamed routes.
