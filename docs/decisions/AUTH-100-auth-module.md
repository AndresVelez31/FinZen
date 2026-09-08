# AUTH-100: Extract a dedicated auth module

## What was done

- **New `src/auth/` module**, three files:
  - `authstore.ts` — a Pinia setup store holding only `currentUserId`.
  - `AuthService.ts` — `login`, `logout`, `getCurrentUser`,
    `isAuthenticated`, and new `isAdmin()` (replaces the
    `currentUser?.role === 'admin'` check that was duplicated between the
    router guard and `AppLayout.vue`).
  - `guards.ts` — `authGuard` (redirects an authenticated user away from
    `/login`, sends an unauthenticated one to `/login` for any non-public
    route) and `adminGuard` (redirects a non-admin away from any
    `meta.admin` route), each a standalone `NavigationGuardWithThis`
    function, registered from `router/index.ts` via two separate
    `router.beforeEach(...)` calls.
- **`userstore.ts`**: `currentUserId` removed — the store now only holds
  `users`.
- **`UserService.ts`**: `login`/`logout`/`getCurrent`/`isAuthenticated`
  removed. It's down to `getAll`/`getById`/`updateRole`/`toggleActive` —
  user CRUD only, no session concerns.
- **`AccountService.ts`/`ActivityService.ts`**: read
  `useAuthStore().currentUserId` instead of `useUserStore().currentUserId`
  (5 call sites each).
- **`router/index.ts`**: the single monolithic `beforeEach` split into
  three: the existing one keeps title-setting and the `:id`-required
  fallback (route-level concerns, not auth), followed by
  `router.beforeEach(authGuard)` and `router.beforeEach(adminGuard)`.
- **`AppLayout.vue`**: `currentUser`/`isAdminUser`/`handleLogout` now call
  `AuthService.getCurrentUser()`/`AuthService.isAdmin()`/`AuthService.logout()`.
- **`LoginView.vue`**: calls `AuthService.login(...)` instead of
  `UserService.login(...)`.
- **`DashboardView.vue`/`UsersShowView.vue`**: their `currentUser` computed
  (used for the greeting and the "Tú" badge / self-action disabling) now
  calls `AuthService.getCurrentUser()`. `UsersShowView.vue` keeps
  `UserService` too, for the user list and role/active management — it
  needs both services, one for "who am I" and one for "manage users".
- **`PiniaConfig.ts`**: the seeded initial state gained an `auth: {
  currentUserId: null }` key and lost `currentUserId` from the `user` key.
  `STORAGE_KEY` bumped from `'finzenState'` to `'finzenState.v2'`.

## Decisions

### Domain services read the auth store directly, not through `AuthService`
`AccountService`/`ActivityService` already read other Pinia stores directly
(`useAccountStore()`, `useTransactionStore()`) — that's the established
pattern for "a Service reads a Store". Routing them through
`AuthService.getCurrentUser()?.id` instead would mean one service calling
into a sibling service just to read an id, and would cost an extra
`useUserStore().users.find(...)` lookup for a value the auth store already
holds directly. `useAuthStore().currentUserId` stays a plain store read,
consistent with how every other store is used in this codebase.

### `authGuard`/`adminGuard` are separate guards, not one combined function
Matches the module design's own naming (`guards.ts` — plural, two
concerns). Splitting also means each guard is independently testable/
readable, and Vue Router's own multi-guard resolution handles the ordering
correctly: if `authGuard` redirects (e.g. unauthenticated user hitting an
admin route), that redirect starts a **new** navigation to `/login` and
`adminGuard` never evaluates against the original stale `to` — it only ever
sees the final resolved target.

### Title-setting and the `:id` fallback stay inline in `router/index.ts`, not in `guards.ts`
Those aren't auth concerns — they apply regardless of who's logged in.
Moving them into `src/auth/` would make that folder responsible for
things that have nothing to do with authentication.

### `STORAGE_KEY` bump instead of a migration
Pinia hydrates each store's state lazily on first use, keyed by store id.
A browser with the pre-this-PR `localStorage` shape (`currentUserId` nested
under `user`, no `auth` key at all) would, if the key weren't bumped, hit
`pinia.state.value.auth === undefined` on first `useAuthStore()` call — Pinia
would then initialize that store fresh from its setup function, i.e.
`currentUserId: null`. That's not actually broken, just an unwanted extra
login prompt (the safest possible failure mode for a session). Bumping the
key sidesteps the question entirely: every browser starts from a clean,
freshly-seeded state that matches the new shape exactly, with no reliance
on how Pinia happens to handle a missing store key. The old `finzenState`
key is left orphaned in `localStorage` — harmless, and clearing other
people's browser storage from application code is out of scope.

## Validation

- `npm run type-check`: no errors.
- `npm run build`: succeeds, no new warnings.
- `npm run lint`: 8 pre-existing errors, identical count/lines to `main`
  (the `PiniaConfig.ts` `localStorage` errors shifted by a few lines because
  of the new comment above `STORAGE_KEY`, same three errors); none related
  to this change.
- Manual pass: login (both demo accounts), logout, an admin route visited
  as a non-admin user (redirects to dashboard), an admin route visited
  unauthenticated (redirects to login, not dashboard), and a fresh browser
  profile with no `localStorage` at all (seeds correctly) — all behave
  identically to `main`.
