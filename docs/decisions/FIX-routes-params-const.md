# Align form views' route param reads with the tutorial convention (plain `const`, not `computed()`)

## What was done

- `src/views/AccountFormView.vue`: `editing`/`accountId` changed from `computed(() => ...)`
  to plain `const`. Removed the now-unused `computed` import.
- `src/views/TransactionFormView.vue`: `editing`/`transactionId` changed the same way.
  `computed` import was kept, since `accounts`/`activities` still use it (see below).
- `src/views/ActivityFormView.vue`: `editing`/`activityId` changed the same way.
  Removed the now-unused `computed` import.
- Every `.value` access on these four values (in `onMounted`, `validate`, `submit`) was
  removed at the same time, since they're now plain primitives, not refs. No template
  changes were needed — Vue already unwraps refs/computed in templates, so
  `{{ editing ? ... : ... }}` works identically either way.

## Decisions

### Why this is safe: all three views only exit via redirect to their list view
This change is only correct because `AccountFormView.vue`, `TransactionFormView.vue`,
and `ActivityFormView.vue` never navigate directly from one instance of themselves to
another (e.g. `/accounts/1/edit` → `/accounts/2/edit`) without passing through a
different route first. Every success and cancel path calls
`router.push`/`router.replace` to the corresponding list route
(`accounts`/`transactions`/`activities`), confirmed by reading all three files before
making this change. Vue Router only reuses a component instance (skipping `setup()`,
and therefore never re-evaluating a plain `const`) when navigating between two routes
that render the *same* component — which never happens here.

**This is a standing assumption, not a permanent guarantee.** If a future feature adds
direct form-to-form navigation (e.g. a "next record" link inside one of these forms),
`editing`/`accountId`/`transactionId`/`activityId` would silently go stale, since a
plain `const` is captured once at `setup()` and never re-evaluated on a route change
that reuses the instance. Revisit this decision (switch back to `computed()`) if that
navigation pattern is ever introduced.

### Why `accounts`/`activities` in `TransactionFormView.vue` keep `computed()`
Unlike `editing`/`transactionId` (which read from `route`, a source that never changes
without a remount in this view), `accounts` and `activities` read from
`AccountService.getAccounts()`/`ActivityService.getActivities()` — reactive Pinia store
state that can legitimately change while the form stays mounted. `computed()` here is
not about route reactivity at all; it's the correct, ordinary way to derive a reactive
view over store data, same as everywhere else in the app. Converting these to `const`
would freeze the account/activity dropdowns to whatever the store held at mount time.

### `App.vue`'s `isBlank` is out of scope (unchanged)
Confirmed as correctly excluded: it reads `route.meta` from a single, app-lifetime-long component instance that must react to every navigation — exactly the case `computed()` exists for.

## Validation

- `npm run type-check`: removing `computed()` turns each of these four values into a plain primitive, so any leftover `.value` access fails to compile (`Property 'value' does not exist on type '...'`) — this was used as a completeness check while editing, not just a final gate.
- `npm run lint`: no new errors in any of the three files.
- Manual test: visited `/accounts/new`, `/activities/new`, `/transactions/new` (blank form) and `/accounts/:id/edit`, `/activities/:id/edit`, `/transactions/:id/edit` (pre-filled form) for all three entities; create, edit, and cancel all behave identically to before this change.