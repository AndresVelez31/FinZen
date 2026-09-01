# ROUTER-15: Configure route navigation guards for authentication & roles

## What was done

- Configured `src/router/index.ts` with the full route table (`login`, `dashboard`, `transactions`, `transaction-new`, `transaction-edit`, `accounts`, `account-new`, `account-edit`, `reports`, `activities`, `users`), integrating the route structure and options from `main`.
- Implemented a `router.beforeEach` navigation guard that:
  - Updates `document.title` based on `to.meta.title`.
  - Redirects to an entity's index route if a required `:id` route parameter is missing.
  - Redirects authenticated users away from `/login` directly to `dashboard`.
  - Allows `meta.public` routes to render without authentication.
  - Redirects unauthenticated users attempting to access private routes to `/login`.
  - Restricts access to routes marked with `meta.admin: true` (`/activities` and `/users`) to admin users, redirecting non-admin users to `/` (`dashboard`).
- Extended TypeScript declarations using `declare module 'vue-router'` for `RouteMeta` (`title`, `public?`, `admin?`, `layout?`).
- Restored `UserService.toggleUserActive(id: number)` in `src/services/UserService.ts` to complement `getUsers`, `getUserById`, `updateUserRole`, `login`, `logout`, `getCurrentUser`, and `isAuthenticated`.
- Reconciled and updated `src/views/UsersView.vue` to consume `UserService` and `formatDate` from `@/utils/formatters.js` instead of the legacy `@/store`.

## Decisions

### Why use `UserService.isAuthenticated()` and `UserService.getCurrentUser()`?
Rather than checking store state directly within the guard, the router relies on static methods provided by `UserService`. This preserves clear separation of concerns, ensuring the router contains zero store-specific state manipulation.

### Why reuse `@/utils/formatters.js` instead of creating `src/utils/formatDate.ts`?
During reconciliation with `main`, the existing `@/utils/formatters.js` utility module was identified as already exporting a formatted date helper (`formatDate`). Reusing this helper avoids duplicating utility logic across the codebase.

### Why does the guard return a route location or boolean instead of calling `next()`?
Returning a value (`true`, `false`, or a route location object) from `beforeEach` is the standard non-deprecated API in Vue Router 4+. It eliminates common bugs associated with multiple `next()` calls in complex branching logic.

### Why is `:id` parameter presence validated via a lookup table?
Using a route-name mapping (`ROUTES_REQUIRING_ID`) allows missing-parameter requests to fallback specifically to their corresponding entity list (e.g., `transaction-edit` falls back to `transactions`), while avoiding tight coupling or unnecessary store queries inside the route guard.

## Validation

- Verified that `npx vue-tsc --noEmit -p tsconfig.app.json` reports no errors in `src/router/index.ts` or `src/services/UserService.ts`.
- Confirmed that path aliases using `.js` extensions comply with project-wide module resolution conventions.
- Formatted touched files according to project Prettier guidelines via `npm run format`.