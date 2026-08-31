# SERVICE-09: Implement UserService with static methods

## What was done

- Created `src/stores/userstore.ts`, a Pinia setup store holding `users` (`UserInterface[]`) and `currentUserId` (`string | null`).
- Created `src/stores/userseeder.ts` with demo accounts (`admin@finzen.app` / `admin123`, `user@finzen.app` / `user123`).
- Created `src/services/UserService.ts` as a class with static methods: `getUsers()`, `getUserById(id)`, `updateUserRole(id, role)`, `toggleUserActive(id)`, `login(email, password)`, `logout()`.
- Registered `userSeeder` in `src/PiniaConfig.ts`, filling in one of the `TODO (Issues 5-7)` stubs left by `INFRA-04-pinia-setup.md`.

## Decisions

### Why a static class backed by a dedicated store?
This mirrors the `ReviewService` / `reviewstore.ts` / `reviewseeder.ts` pattern from the course tutorials (SPA-CSR-Vue III): the store is a lean, logic-free container of reactive state, and the service is the only layer allowed to read from and mutate it. No Vue component or view imports the store directly.

### Why does `currentUserId` live inside `userstore.ts` instead of a separate session store?
The documented domain model only defines four entities (User, Account, Activity, Transaction); "session" isn't one of them. Adding a single extra `ref` to the existing user store keeps the store lean (per `Programming-Rules.md`) without introducing a new, undocumented store for a concept that isn't part of the domain.

### Why does `login()` return a discriminated union instead of throwing or returning `null`?
`{ ok: true, user }` or `{ ok: false, error }` lets the calling view branch on the result without try/catch, and keeps the error message (invalid credentials vs. inactive account) explicit and typed, instead of overloading a single nullable return value.

### Sanitization
`login()` trims and lowercases the email before comparing it against the store, per the sanitization rules in the architecture guide.

### `getCurrentUser()` (added later, during ROUTER-15)
This method was **not** part of the original SERVICE-09 acceptance criteria. It was added afterward because `ROUTER-15`'s navigation guard needs to resolve the authenticated user (and their role) from `currentUserId`. It's documented here since it lives in `UserService.ts`; see `ROUTER-15-route-guards.md` for the consuming context.

### Known gap found while touching `PiniaConfig.ts`: missing `localStorage` ESLint global
`eslint.config.ts` declares browser globals explicitly (`document`, `getComputedStyle`, `setTimeout`) per `INFRA-03-linting-setup.md`, but never declared `localStorage` — which `PiniaConfig.ts` already used before this issue. `npm run lint` therefore fails on `PiniaConfig.ts` with `'localStorage' is not defined (no-undef)`. This is a pre-existing gap introduced in `INFRA-04`, not something introduced by this issue, and is intentionally **not** fixed here to keep this PR scoped to `SERVICE-09`.

## Validation

- `getUsers()`, `getUserById()`, `login()` (valid and invalid credentials), and `logout()` were exercised manually via temporary calls in `main.ts` and verified in the browser console and in `localStorage` (`finzenState`); the temporary calls were removed before committing.
- `npx vue-tsc --noEmit`, scoped to `userstore.ts`, `userseeder.ts`, `UserService.ts`, and `PiniaConfig.ts`, reports no errors.
- `npm run lint` passes except for the pre-existing `localStorage` gap noted above.
- As documented in `INFRA-04-pinia-setup.md`, the global `npm run type-check` / `npm run build` are expected to keep failing due to unmigrated legacy views (`@/store`); none of the ~186 errors in the current baseline originate from the files added in this issue.