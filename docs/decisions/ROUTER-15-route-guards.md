# ROUTER-15: Configure route navigation guards for authentication & roles

## What was done

- Created `src/router/index.ts` with the full route table (`login`, `dashboard`, `transactions`, `transaction-new`, `transaction-edit`, `accounts`, `account-new`, `account-edit`, `reports`, `activities`, `users`), replacing the empty `routes: []` that previously lived inline in `main.ts`. This fills the gap noted in `INFRA-02-folder-structure.md` ("router will be rebuilt ... in Issue #15").
- Added a `router.beforeEach` guard that: redirects to the entity's index route when a required `:id` param is missing, allows `meta.public` routes through, redirects unauthenticated users to `/login`, and redirects non-admin users away from `meta.admin` routes.
- Added a `router.afterEach` that sets `document.title` from `meta.title`.
- Added a `declare module 'vue-router'` augmentation for `RouteMeta` (`title`, `public?`, `admin?`, `layout?`).
- Updated `main.ts` to import the router from `./router` instead of constructing it inline.
- Added `UserService.getCurrentUser()` (see `SERVICE-09-user-service.md`) so the guard can resolve the authenticated user without querying the store directly.
- Migrated `src/views/LoginView.vue` and `src/views/UsersView.vue` off the deleted `@/store` module, onto `UserService`.
- Created `src/utils/formatDate.ts`, a pure formatting function `UsersView.vue` needed after dropping `@/store`.

## Decisions

### Why does the guard return a value instead of calling `next()`?
The `(to, from, next)` signature with an explicit `next()` call is the legacy Vue Router 3/early-4 API. Returning a value (`true`, `false`, or a route location) from `beforeEach` is the current, non-deprecated pattern, and the project's installed `vue-router` version (5.x) carries no breaking changes from 4.x for this API, so there is no compatibility risk in using it.

### Why is `:id` existence validated via a route-name lookup table instead of a generic path check?
Checking by name (`transaction-edit`, `account-edit`) lets the guard redirect to the *correct* index route (`transactions` vs. `accounts`) for each entity, rather than a single generic fallback. It also avoids importing the Transaction/Account stores into the router — those don't exist yet (see `SERVICE-12`, currently blocked pending a decision with the team on cross-domain validation), so the guard intentionally only checks that the param is present, not that it resolves to a real record. Deeper existence checks against the actual entity remain the responsibility of the view (already implemented there via `onMounted` + `router.replace`).

### Why does `logout` not need dedicated logic in the router?
Once `UserService.logout()` clears `currentUserId` in the store, the next navigation to any non-public route already fails the `!currentUser` check in `beforeEach` and redirects to `/login`. Duplicating that check in a separate "logout" code path would just be the same guard logic twice.

### Why were `LoginView.vue` and `UsersView.vue` migrated in this PR, when migrating legacy views is scoped to future issues (#4/#8)?
Both are exceptions, not scope creep:
- `LoginView.vue` is the redirect *target* for every unauthenticated navigation. Without migrating it off the deleted `@/store` module, the guard's primary acceptance criterion ("redirect unauthenticated users to `/login`") cannot be demonstrated at all — the app crashes on render instead of showing the login screen.
- `UsersView.vue` is the destination used to demonstrate the `meta.admin` guard. It was migrated using only methods that already exist on `UserService` (`getUsers`, `updateUserRole`, `toggleUserActive`) — no new business logic was written, only the import target changed.

No other legacy view was touched, since they depend on `AccountService`/`ActivityService`/`TransactionService`, none of which exist yet.

## Validation

- Manual testing in the browser (with `console.log` temporarily added to each guard branch, removed before committing): confirmed that visiting a protected route while unauthenticated redirects to `/login`; that logging in as `user@finzen.app` and visiting `/activities` redirects to `/`; that logging in as `admin@finzen.app` allows access to `/activities` and `/users`; and that `document.title` updates per route.
- `npx vue-tsc --noEmit`, scoped to `router/index.ts`, `main.ts`, `UserService.ts`, `LoginView.vue`, and `UsersView.vue`, reports no errors.
- `npm run lint` passes for all files touched in this issue except the pre-existing `localStorage` gap documented in `SERVICE-09-user-service.md`.
- `UsersView.vue` still reports `TS18046 ('unknown')` / `TS2345` errors inside the `TablaGenerica` slot bindings. This is a pre-existing typing gap in the shared `TablaGenerica.vue` component (its slots are untyped), also affecting `AccountsView.vue` and `TransactionsView.vue`, and is out of scope for this issue.
- As documented in `INFRA-04-pinia-setup.md`, the global `npm run type-check` / `npm run build` are expected to keep failing due to the remaining unmigrated legacy views.