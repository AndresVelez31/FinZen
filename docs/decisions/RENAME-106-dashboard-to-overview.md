# RENAME-106: Rename DashboardView to OverviewView

## Status

Accepted

## Context

`DashboardView.vue` is FinZen's home page (`/`, `name: 'dashboard'`):
a greeting, three KPI cards (balance, monthly expense/income), a
doughnut chart of expenses by activity, and the 5 most recent
transactions.

"Dashboard" was never actually the name shown to the user — the sidebar
nav item already reads `label: 'Resumen'` and the route's own
`meta.title` is `'Resumen | FinZen'`. "Dashboard" only survived as the
internal file name and route name, and it doesn't describe this page
well: it's a one-screen financial overview, not a configurable panel of
widgets (the connotation "dashboard" usually carries), and the app
already has a separate, more analytics-heavy `ReportsView.vue` that
"dashboard" could be confused with.

## Decision

Renamed to match the page's actual purpose and its existing Spanish
label (Resumen → Overview):

- `frontend/src/views/DashboardView.vue` → `OverviewView.vue`
- `frontend/src/components/dashboard/` → `frontend/src/components/overview/`
  (holds `RecentTransactionsTable.vue`, used only by this view)
- Route `name: 'dashboard'` → `name: 'overview'` in `router/index.ts`
  (the `path: '/'` and `meta.title: 'Resumen | FinZen'` are unchanged —
  this is an internal identifier, not user-facing)
- Every call site referencing the route by name updated:
  `auth/guards.ts` (`authGuard`'s post-login redirect, `adminGuard`'s
  redirect for non-admins), `views/LoginView.vue`'s post-login
  `router.push`, and `components/layout/AppLayout.vue`'s nav array.

`LayoutDashboard` (the icon from `lucide-vue-next` used for this nav
item) is untouched — it's a third-party import name, not something this
project controls or should rename.

## Consequences

- No user-visible change: the sidebar already said "Resumen", the page
  title already said "Resumen | FinZen", and the URL (`/`) doesn't
  change.
- `npm run type-check`, `npm run build`, and `npm run lint:eslint` all
  pass with the same pre-existing 8-error ESLint baseline.
- Any future PR referencing this view by name should use `OverviewView`/
  `'overview'` — searched the full `frontend/src` tree to confirm no
  other reference to `dashboard`/`Dashboard` remains outside of the
  `LayoutDashboard` icon import.
