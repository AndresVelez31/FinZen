# AUTH-14: Implement LoginView with Authentication Handling

## Status

Complete from a functional perspective.

The login view, service integration, session handling, inactive-account validation, router
integration, and authenticated-user redirect required by AUTH-14 are implemented and were manually
verified.

During integration testing, two pre-existing dependencies outside the core login flow were also
identified:

- `AppLayout.vue` was not clearing the actual persisted session during logout.
- `DashboardView.vue` still depends on the removed legacy `@/store` module, causing the successful
  login redirect to fail when Vue attempts to load the dashboard.

The logout integration was corrected through `UserService.logout()`. The dashboard dependency is
not part of the login logic itself and should be addressed independently instead of expanding
AUTH-14 into a dashboard refactor.

Repository quality checks must still be executed once more before merge.

---

## Context

`LoginView.vue` existed as a visual prototype that authenticated through the removed `@/store`
module.

AUTH-14 replaces that dependency with the architecture required by the repository:

```text
View -> Service -> Store
```

The current deliverable does not use a remote authentication API. Authentication is simulated in
the frontend using the users initialized in Pinia.

The active session is represented by:

```ts
currentUserId
```

and Pinia state is persisted in:

```text
localStorage
```

through the existing `PiniaConfig.ts` configuration.

Therefore, authentication in the current deliverable is synchronous and frontend-only.

---

## What was done

- Updated `src/views/LoginView.vue` to call `UserService.login(email, password)`.
- Removed the dependency on the legacy `@/store` authentication implementation.
- Kept email, password, loading, password visibility, and error feedback as local presentation
  state.
- Added explicit TypeScript types for the demo account selector.
- Removed the artificial login delay.
- Awaited router navigation after successful authentication.
- Added accessible feedback with `aria-invalid`, `aria-live`, `aria-busy`, and descriptive password
  visibility labels.
- Added `UserService.getCurrentUser()` as the canonical session query.
- Added `UserService.isAuthenticated()` for router-level authentication checks.
- Added `UserService.logout()` as the correct way to invalidate the current session.
- Added a `/login` route with public, blank-layout, and title metadata.
- Added a redirect from `/login` to the dashboard when an authenticated session already exists.
- Moved router creation out of `main.ts` and preserved Pinia installation before router
  installation.
- Extended `UserInterface` with an `active` property.
- Updated the user seed data to provide the active/inactive account state.
- Updated `UserService.login()` to reject inactive users with a dedicated error message.
- Verified invalid credentials manually.
- Verified inactive-user credentials manually.
- Verified successful authentication manually.
- Verified authenticated access to `/login` redirects back to `/`.
- Identified the persisted-state behavior of the user seeder and documented how to reset it during
  development.
- Connected application logout to `UserService.logout()` instead of clearing only a local layout
  variable.
- Identified the legacy `DashboardView.vue` dependency that initially made a successful login look
  like an authentication failure.

---

## Authentication Flow

The implemented login flow is:

```text
User opens /login
        |
        v
Enters email and password
        |
        v
LoginView.submit()
        |
        v
UserService.login(email, password)
        |
        v
Normalize email
        |
        v
Find matching user
        |
        +--------------------------+
        |                          |
        | User not found           |
        | or password invalid      |
        |                          |
        v                          |
"Credenciales inválidas."         |
                                   |
                                   v
                         Credentials valid
                                   |
                                   v
                            Check user.active
                                   |
                     +-------------+-------------+
                     |                           |
                     v                           v
               active = false              active = true
                     |                           |
                     v                           v
      "Tu cuenta se encuentra         currentUserId = user.id
              inactiva."                       |
                                               v
                                      Successful result
                                               |
                                               v
                                        router.push('/')
```

This separates UI concerns from authentication and session state.

---

## Decisions

### 1. Preserve the View -> Service -> Store Boundary

The view never imports or mutates a Pinia store.

It submits credentials through:

```ts
UserService.login(email, password)
```

The service performs:

- Email normalization.
- User lookup.
- Password validation.
- Active-account validation.
- Session mutation.

The resulting architecture is:

```text
LoginView.vue
      |
      v
UserService
      |
      v
UserStore
```

instead of:

```text
LoginView.vue
      |
      v
UserStore
```

Direct store access from the view would violate the architecture defined by the repository.

---

### 2. Keep Presentation State in the View

The following values remain local to `LoginView.vue`:

```text
email
password
showPassword
loading
errorMessage
```

These values only affect the UI.

Authentication rules and session state do not belong in the view and therefore remain in the
service/store layers.

---

### 3. Query Authentication Through UserService

Navigation guards and other consumers use:

```ts
UserService.isAuthenticated()
```

instead of reading Pinia or `localStorage` directly.

The current user can be obtained through:

```ts
UserService.getCurrentUser()
```

This provides a single service boundary for authentication-related queries.

The router therefore does not need to know how the session is internally represented.

---

### 4. Use currentUserId as the Session Identifier

The current frontend session is represented by:

```ts
currentUserId
```

For example:

```text
currentUserId = null
```

means:

```text
No active session
```

while:

```text
currentUserId = 1
```

means that the user whose ID is `1` is authenticated.

The application does not create another duplicate session object.

The current user can instead be resolved from the existing user collection using the identifier.

---

### 5. Login Route Metadata

The login route uses:

```ts
meta: {
  public: true,
  layout: 'blank',
  title: 'Iniciar sesión | FinZen',
}
```

The metadata has the following responsibilities:

- `public: true` identifies `/login` as accessible without authentication.
- `layout: 'blank'` prevents `AppLayout` from being rendered around the authentication page.
- `title` provides the corresponding browser/page title.

The full route catalogue and authorization policy remain part of the router integration work and
should continue to be coordinated with the corresponding routing issue.

AUTH-14 only requires the login-related router behavior needed by this feature.

---

### 6. Authenticated Users Must Not Return to Login

A global navigation guard checks:

```ts
UserService.isAuthenticated()
```

when navigation occurs.

For `/login`, the behavior is:

```text
Authenticated user
        |
        v
Attempts to open /login
        |
        v
UserService.isAuthenticated() === true
        |
        v
Redirect to /
```

This prevents the login page from being shown when an active session already exists.

---

### 7. Inactive Accounts Are Represented Explicitly

AUTH-14 requires:

> Inactive user credentials show a dedicated inactive account warning.

To support this requirement, `UserInterface` was extended with:

```ts
active: boolean;
```

The user model can therefore explicitly represent:

```ts
active: true
```

and:

```ts
active: false
```

The service performs inactive-account validation after validating the submitted credentials.

Conceptually:

```text
Find user
    |
    v
Validate password
    |
    v
Validate active status
```

This ordering is intentional.

An inactive-account message should not be returned for a request that does not first contain valid
credentials, because that would expose information about account state to someone who does not know
the password.

---

### 8. Authentication Errors Are Returned by the Service

The service returns typed authentication results instead of manipulating the DOM or view state.

Invalid credentials return:

```text
Credenciales inválidas.
```

Inactive accounts return:

```text
Tu cuenta se encuentra inactiva.
```

The view only renders the returned message:

```text
UserService
      |
      v
determines the result
      |
      v
LoginView
      |
      v
renders the result
```

This keeps authentication policy outside the UI.

---

## User Model Change

`UserInterface` now includes:

```ts
active: boolean;
```

Conceptually, the user structure is:

```ts
export interface UserInterface {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

The user seeder must therefore provide the same property for every user.

Example:

```ts
{
  id: 1,
  name: 'Admin Demo',
  email: 'admin@finzen.app',
  password: 'admin123',
  role: 'admin',
  active: true,
  createdAt: '...',
  updatedAt: '...',
}
```

This allows inactive-account behavior to be represented by the domain data instead of being
simulated in `LoginView.vue`.

---

## Inactive Account Handling

`UserService.login()` distinguishes three important scenarios.

### Invalid user or password

```text
Email does not exist
OR
Password does not match
```

Result:

```text
Credenciales inválidas.
```

### Valid credentials but inactive account

```text
User exists
Password matches
active = false
```

Result:

```text
Tu cuenta se encuentra inactiva.
```

### Valid active account

```text
User exists
Password matches
active = true
```

Result:

```text
currentUserId = user.id
```

followed by successful navigation.

---

## Seed Data and localStorage

During manual validation an important interaction between the seeder and persisted Pinia state was
identified.

The application stores Pinia state in `localStorage` using:

```text
finzenState
```

The seeder provides initial state only when there is no previous persisted state.

Conceptually:

```text
Application starts
        |
        v
Does finzenState exist?
        |
        +---------------------+
        |                     |
       Yes                    No
        |                     |
        v                     v
Load existing          Initialize using
Pinia state            current seed data
```

This means that changing:

```ts
active: true
```

to:

```ts
active: false
```

inside `userseeder.ts` does not automatically modify a user that was already persisted in the
browser.

During testing, this initially made the inactive-account validation appear not to work.

The persisted development state can be reset with:

```js
localStorage.removeItem('finzenState')
```

After reloading the page, the current user seeder is used again.

This behavior is expected: seeders provide initial data; they are not migrations for previously
persisted browser state.

---

## Session Persistence

A successful login stores:

```ts
currentUserId = user.id
```

in Pinia.

Because the current Pinia configuration watches and persists application state, the identifier is
also stored in `localStorage`.

Therefore:

```text
Successful login
        |
        v
currentUserId assigned
        |
        v
Pinia state changes
        |
        v
PiniaConfig persists state
        |
        v
localStorage
```

The session can consequently survive a browser refresh under the current frontend-only
authentication model.

---

## Logout Integration

During testing, logout initially did not work correctly.

The existing `AppLayout` behavior cleared a local variable, but the actual authentication state was
represented by:

```ts
currentUserId
```

Therefore the original behavior was effectively:

```text
currentUserId = 1
        |
        v
User clicks logout
        |
        v
Local AppLayout state cleared
        |
        v
currentUserId is still 1
        |
        v
router.push('/login')
        |
        v
Router detects authenticated session
        |
        v
Redirects back to /
```

The session was never actually invalidated.

The correct integration uses:

```ts
UserService.logout()
```

which clears:

```ts
currentUserId
```

The corrected flow is:

```text
User clicks logout
        |
        v
UserService.logout()
        |
        v
currentUserId = null
        |
        v
router.push('/login')
        |
        v
UserService.isAuthenticated() === false
        |
        v
Login page is displayed
```

Logout is not one of the primary AUTH-14 acceptance criteria, but correcting it was necessary to
properly test the authentication flow multiple times.

---

## Dashboard Integration Finding

Successful authentication initially appeared to fail.

The user entered valid credentials, but the UI showed:

```text
No fue posible iniciar sesión. Inténtalo nuevamente.
```

Browser-console inspection showed that authentication itself was not the failing operation.

The actual sequence was:

```text
UserService.login()
        |
        v
Credentials valid
        |
        v
currentUserId assigned
        |
        v
router.push('/')
        |
        v
Vue dynamically imports DashboardView.vue
        |
        v
DashboardView imports legacy '@/store'
        |
        v
Module cannot be resolved
        |
        v
Route navigation throws an exception
```

Because router navigation occurred inside the login `try/catch`, the navigation failure was
initially presented as if authentication itself had failed.

The console confirmed the problem with an error similar to:

```text
Failed to fetch dynamically imported module:
.../DashboardView.vue
```

and a Vue Router navigation warning.

This demonstrated that:

```text
Authentication failure
```

and:

```text
Successful authentication followed by route/component failure
```

are separate concerns.

A minimal compatible Dashboard was temporarily used to isolate and manually validate AUTH-14.

A full dashboard migration is outside the scope of this issue and should not be included as part of
the login feature unless coordinated separately.

---

## Acceptance Criteria Status

| Criterion                                             | Status   | Notes                                                                                             |
| ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `LoginView.vue` uses `<script setup lang="ts">`       | Complete | Vue 3 Composition API and TypeScript are used.                                                    |
| Form contains email and password fields               | Complete | Both fields use local reactive state.                                                             |
| Invalid credentials show a clear error                | Verified | Invalid user/password shows `Credenciales inválidas.`                                             |
| Inactive credentials show a dedicated warning         | Verified | Valid inactive account shows `Tu cuenta se encuentra inactiva.`                                   |
| Successful login redirects to `/`                     | Verified | Authentication succeeds and navigation targets the dashboard.                                    |
| View calls `UserService.login()`                      | Complete | The view does not access the user store directly.                                                 |
| `/login` has `meta.public: true`                      | Complete | Blank layout and title metadata are also configured.                                              |
| Authenticated users visiting `/login` redirect to `/` | Verified | The global router guard redirects authenticated sessions.                                         |
| Fully responsive and consistent styling               | Verified | Login UI follows the existing FinZen styling and responsive structure.                            |

The broader private-route authorization policy is not treated as an AUTH-14 completion blocker and
should remain part of the corresponding routing integration work.

---

## Manual Validation

### Valid Active User

Input:

```text
Existing email
Correct password
active = true
```

Expected:

```text
Successful authentication
        |
        v
currentUserId assigned
        |
        v
redirect /
```

Result:

```text
Passed
```

---

### Invalid Email

Input:

```text
Unknown email
```

Expected:

```text
Credenciales inválidas.
```

Result:

```text
Passed
```

---

### Invalid Password

Input:

```text
Existing email
Incorrect password
```

Expected:

```text
Credenciales inválidas.
```

Result:

```text
Passed
```

---

### Inactive User

Input:

```text
Existing email
Correct password
active = false
```

Persisted development data was reset when necessary with:

```js
localStorage.removeItem('finzenState')
```

Expected:

```text
Tu cuenta se encuentra inactiva.
```

Result:

```text
Passed
```

---

### Authenticated User Visiting Login

Initial state:

```text
currentUserId != null
```

Action:

```text
Navigate manually to /login
```

Expected:

```text
Redirect to /
```

Result:

```text
Passed
```

---

### Logout

Initial state:

```text
Authenticated user
```

Action:

```text
Logout
```

Expected:

```text
UserService.logout()
        |
        v
currentUserId = null
        |
        v
/login
```

Result:

```text
Passed after integrating AppLayout with UserService.logout().
```

---

### Session Persistence

Initial state:

```text
Successful login
```

Action:

```text
Reload browser
```

Expected:

```text
Persisted Pinia session remains available through finzenState.
```

Result:

```text
Behavior confirmed through the existing Pinia persistence configuration.
```

---

## Architecture After AUTH-14

The authentication architecture is now:

```text
+--------------------+
|   LoginView.vue    |
|--------------------|
| email              |
| password           |
| showPassword       |
| loading            |
| errorMessage       |
+---------+----------+
          |
          | login(email, password)
          v
+--------------------+
|    UserService     |
|--------------------|
| login()            |
| logout()           |
| getCurrentUser()   |
| isAuthenticated()  |
+---------+----------+
          |
          v
+--------------------+
|     UserStore      |
|--------------------|
| users              |
| currentUserId      |
+---------+----------+
          |
          v
+--------------------+
|    PiniaConfig     |
|--------------------|
| persistence        |
+---------+----------+
          |
          v
+--------------------+
|    localStorage    |
|--------------------|
| finzenState        |
+--------------------+
```

Vue Router interacts with the service instead of the store:

```text
                  Vue Router
                      |
              beforeEach guard
                      |
                      v
          UserService.isAuthenticated()
                      |
              +-------+-------+
              |               |
              v               v
          /login              /
```

This preserves the required service boundary.

---

## Responsibilities by File

### `LoginView.vue`

Responsible for:

- Capturing email.
- Capturing password.
- Password visibility.
- Submission/loading state.
- Displaying authentication feedback.
- Triggering navigation after successful authentication.

Not responsible for:

- Searching users.
- Reading Pinia directly.
- Validating account status.
- Mutating session state directly.

---

### `UserService.ts`

Responsible for:

- Normalizing authentication input.
- Looking up users.
- Validating credentials.
- Validating inactive accounts.
- Creating a frontend session.
- Clearing the session.
- Returning the current authenticated user.
- Reporting whether the application currently has a valid authenticated user.

---

### `UserInterface.ts`

Responsible for defining the user contract, including:

```ts
active: boolean;
```

---

### `userseeder.ts`

Responsible for providing initial development/demo users.

It is only initialization data and does not override previously persisted state automatically.

---

### `userstore.ts`

Responsible for storing:

```text
users
currentUserId
```

It does not contain UI behavior.

---

### `PiniaConfig.ts`

Responsible for:

- Installing persisted Pinia state.
- Loading previously stored application state.
- Initializing seed data when no persisted state exists.
- Persisting state changes to `localStorage`.

---

### `router/index.ts`

Responsible for:

- Defining `/login`.
- Defining dashboard navigation used by AUTH-14.
- Configuring login metadata.
- Redirecting authenticated users away from `/login`.

The complete application route catalogue remains separate router work.

---

### `main.ts`

Responsible for installing application dependencies in the required order.

Pinia is installed before Vue Router so authentication guards can safely query services that depend
on stores.

---

### `AppLayout.vue`

Related integration responsibility:

- Calls `UserService.logout()` when the user confirms logout.
- Does not maintain an independent authentication session.

---

### `DashboardView.vue`

Not part of the authentication implementation itself.

It became relevant during testing because its legacy `@/store` dependency prevented the successful
login redirect from completing.

Its full migration should be handled independently.

---

## Validation and Quality Checks

Manual authentication verification now passes for:

- Valid credentials.
- Invalid credentials.
- Inactive accounts.
- Successful redirect.
- Authenticated access to `/login`.
- Logout.
- Persisted development session behavior.

Before the final merge, the repository quality commands should be executed again:

```bash
npm run lint
npm run type-check
npm run build
```

The browser console should also be inspected to ensure there are no unexplained runtime errors
caused by files included in the AUTH-14 changes.

No automated authentication test suite currently replaces the manual verification described above.

---

## Remaining Follow-up Before Closing / Merge

### 1. Run the repository quality checks

Execute:

```bash
npm run lint
npm run type-check
npm run build
```

and confirm that AUTH-14 does not introduce new errors.

---

### 2. Review the final Dashboard change

A simplified Dashboard was used during debugging to isolate the successful authentication redirect.

That temporary implementation should not accidentally replace unrelated dashboard functionality in
the final AUTH-14 commit.

The legacy dashboard migration must remain separate from the login feature unless intentionally
approved.

---

### 3. Keep the final user seed state intentional

During inactive-user testing one demo user may temporarily be configured as:

```ts
active: false
```

Before merge, confirm whether the repository should:

- Keep both primary demo users active, or
- Deliberately retain an inactive demo account for acceptance testing.

The final state must be intentional rather than leftover test data.

---

### 4. Align the domain documentation

AUTH-14 now requires and uses:

```ts
active: boolean;
```

in `UserInterface`.

If `docs/domain-model.md` still states that `User` does not contain an active/inactive property, the
documentation must be aligned with the implemented model or the corresponding domain decision must
be documented explicitly.

Code and canonical documentation should not describe different user models.

---

### 5. Keep router expansion outside AUTH-14

The full private-route catalogue, role-based guards, administrative authorization, and remaining
routes should continue through their corresponding routing issue.

They should not be added to AUTH-14 merely because the login feature now introduces the router.

---

## Final Result

AUTH-14 now implements the frontend login flow using the architecture required by FinZen:

```text
LoginView
    |
    v
UserService
    |
    v
UserStore
    |
    v
currentUserId
    |
    v
Pinia persistence
    |
    v
localStorage
```

The following scenarios were successfully verified:

```text
Valid active user
        -> Login
        -> Dashboard redirect

Invalid credentials
        -> Authentication error

Valid inactive user
        -> Dedicated inactive-account warning

Authenticated user + /login
        -> Redirect to /

Logout
        -> currentUserId = null
        -> /login
```

The issue therefore satisfies its authentication behavior requirements.

The authentication implemented in this deliverable is intentionally frontend-only and based on
seeded users.

In a production architecture:

```text
LoginView
    |
    v
Authentication Service
    |
    v
HTTP/API
    |
    v
Backend
    |
    v
Database
```

credential verification would occur on the server, passwords would never be stored as plain
frontend seed data, and the backend would return an appropriate secure session or token.

That backend authentication architecture is outside the scope of AUTH-14.
