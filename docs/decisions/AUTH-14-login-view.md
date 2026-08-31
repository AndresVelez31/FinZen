# AUTH-14: Implement LoginView with Authentication Handling

## Status

In progress. The login view and its service integration are implemented, but the issue is not
ready to close because some acceptance criteria and repository quality checks remain unresolved.

## Context

`LoginView.vue` existed as a visual prototype that authenticated through the removed `@/store`
module. AUTH-14 replaces that dependency with the required `View -> Service -> Store` flow and
introduces the minimum session queries needed by navigation guards.

The application persists its Pinia state in `localStorage`; there is no remote authentication API
in this deliverable. Therefore, authentication is synchronous and `currentUserId` represents the
active session.

## What was done

- Updated `src/views/LoginView.vue` to call `UserService.login(email, password)`.
- Kept email, password, loading, password visibility, and error feedback as local presentation
  state.
- Added explicit TypeScript types for the demo account selector.
- Removed the artificial login delay and awaited router navigation after a successful login.
- Added accessible feedback with `aria-invalid`, `aria-live`, `aria-busy`, and descriptive password
  visibility labels.
- Added `UserService.getCurrentUser()` and `UserService.isAuthenticated()` as static session query
  methods.
- Added a `/login` route with public, blank-layout, and title metadata.
- Added a redirect from `/login` to the dashboard when a session already exists.
- Moved router creation out of `main.ts` and preserved Pinia installation before router
  installation.

## Decisions

### 1. Preserve the View -> Service -> Store Boundary

The view never imports or mutates a Pinia store. It submits credentials to the static
`UserService.login()` method, which performs email normalization, credential validation, and the
session mutation.

### 2. Keep Presentation State in the View

Form values, password visibility, submission state, and rendered feedback belong to the view
because they are local UI concerns. Credential validation and session state remain in the service
and store layers.

### 3. Query Authentication Through UserService

Navigation guards use `UserService.isAuthenticated()` instead of reading `localStorage` or Pinia
directly. `isAuthenticated()` delegates to `getCurrentUser()`, ensuring that a stored identifier
only counts as a valid session when its user still exists.

### 4. Login Route Metadata

The login route uses the following metadata:

- `public: true` marks the route as accessible without a session.
- `layout: 'blank'` makes `App.vue` render the login page without `AppLayout`.
- `title` provides the page title required by the routing standards.

The current router only registers the login and dashboard routes. The complete route catalogue,
private-route protection, administrative guards, and integration with the application layout must
be coordinated with Issue #15.

### 5. Inactive Accounts Require a Domain Decision

The issue requests a dedicated warning for inactive accounts, but the canonical domain model
explicitly states that `User` does not contain an `active` field. `UserInterface`, the user seeder,
and `UserService` therefore cannot currently represent or distinguish an inactive account.

This criterion must not be simulated in the view or inferred from another field. Before it can be
implemented, the owner must either remove the criterion or authorize a domain change propagated
through `docs/domain-model.md`, `UserInterface`, seed data, persisted-state migration, and
`UserService`.

## Acceptance Criteria Status

| Criterion                                             | Status                                   | Notes                                                                                               |
| ----------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `LoginView.vue` uses `<script setup lang="ts">`       | Complete                                 | The existing SFC pattern is preserved.                                                              |
| Form contains email and password fields               | Complete                                 | Both fields are bound to typed local refs.                                                          |
| Invalid credentials show a clear error                | Implemented, pending manual verification | The service returns a generic credential error rendered with an alert role.                         |
| Inactive credentials show a dedicated warning         | Blocked                                  | The canonical `User` model has no inactive state.                                                   |
| Successful login redirects to `/`                     | Implemented, not runnable yet            | Navigation targets the dashboard, but the current dashboard dependency prevents a successful build. |
| View calls `UserService.login()`                      | Complete                                 | There is no direct store access from the view.                                                      |
| `/login` has `meta.public: true`                      | Complete                                 | Blank-layout and title metadata are also present.                                                   |
| Authenticated users visiting `/login` redirect to `/` | Implemented, pending manual verification | Implemented in the global navigation guard.                                                         |
| Private routes require authentication                 | Pending                                  | The current guard does not redirect anonymous users away from `/`.                                  |
| Fully responsive and consistent styling               | Pending verification                     | Desktop/tablet rules exist; narrow mobile behavior still needs manual verification.                 |

## Validation

The following non-mutating checks were run during review:

- `oxlint .`: passes.
- ESLint on the four changed source files: passes.
- Prettier check on the four changed source files: fails; formatting must be applied.
- `npm run type-check`: fails. One issue-specific error is caused by the `Index.ts` filename being
  imported as lowercase `index`; additional failures already exist in unrelated legacy views.
- `npm run build`: fails because `DashboardView.vue` still imports the removed `@/store` module;
  adding the dashboard route makes Vite load that unresolved dependency.

No automated test framework or `test` script currently exists in the repository. Manual
verification must cover empty and malformed input, invalid credentials, successful login, session
persistence, authenticated access to `/login`, anonymous access to private routes, keyboard use,
password visibility, and mobile viewports.

## Required Follow-up Before Closing

1. Rename `src/router/Index.ts` to `src/router/index.ts` so file casing matches the import.
2. Add the missing unauthenticated-private-route branch to the navigation guard.
3. Integrate logout with `UserService.logout()` or coordinate the dependency that owns
   `AppLayout`; its current local stub cannot clear the persisted session.
4. Complete the route catalogue through Issue #15 before treating this router as production-ready.
5. Resolve the inactive-account conflict with the owner and update the implementation or issue.
6. Add explicit malformed-email UX validation or re-enable native email validation.
7. Apply the repository formatter and rerun lint, type-check, and build.
8. Remove the unrelated `package-lock.json` metadata rewrite unless a dependency change is
   intentionally part of this issue.
