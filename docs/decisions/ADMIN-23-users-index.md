# ADMIN-23: Implement UsersIndexView

## Status

Functionally complete.

The administrative users view was migrated to the current FinZen architecture and now follows:

```text
View -> Service -> Store
```

The view allows administrators to:

- List registered users.
- View name, email, role, active status, and creation date.
- Filter users by role.
- Change a user's role.
- Activate or deactivate a user.
- Prevent the current administrator from changing their own role or active status.
- Rely on the existing authentication flow to block inactive users from logging in.

Access to `/users` is restricted through the router metadata and the global navigation guard.

---

## Context

The project already contained a legacy users administration view.

The original implementation included:

- User listing.
- Role filtering.
- Role changes.
- Statistics.
- A reusable table component.

ADMIN-23 extends and aligns that functionality with the current authentication and domain model.

The current user model contains:

```text
id
name
email
password
role
active
createdAt
updatedAt
```

The `active` field had already been introduced during AUTH-14 to support inactive-account authentication behavior.

Therefore, ADMIN-23 can directly use that property for administrative activation and deactivation.

---

## What Was Done

- Renamed the users administration view to:

```text
UsersIndexView.vue
```

- Updated the router to reference `UsersIndexView.vue`.
- Preserved the `/users` route.
- Kept the route restricted through:

```ts
meta: {
  admin: true,
}
```

- Used `UserService.getUsers()` to obtain users.
- Used `UserService.getCurrentUser()` to identify the current administrator.
- Added a role filter using `SelectorFiltro`.
- Preserved the user statistics cards.
- Displayed:
  - Name.
  - Email.
  - Role.
  - Active/inactive state.
  - Creation date.
- Used the reusable `GenericTable` component.
- Added `UserService.toggleUserActive(id)`.
- Connected role changes to:

```ts
UserService.updateUserRole()
```

- Connected active-state changes to:

```ts
UserService.toggleUserActive()
```

- Added confirmation before role changes.
- Added confirmation before activating or deactivating a user.
- Prevented the current administrator from modifying their own role.
- Prevented the current administrator from deactivating themselves.
- Removed the artificial loading delay because user data is obtained synchronously from Pinia.
- Preserved responsive layout and reusable shared components.
- Renamed the shared table component from:

```text
TablaGenerica.vue
```

to:

```text
GenericTable.vue
```

to keep source-code naming in English.

The visible application text remains in Spanish.

---

## Architecture

ADMIN-23 follows the same layered architecture used by the rest of FinZen:

```text
UsersIndexView
      |
      v
UserService
      |
      v
UserStore
```

The View does not import or modify `UserStore` directly.

For example, changing a role is performed through:

```ts
UserService.updateUserRole(user.id, newRole);
```

instead of directly doing:

```ts
user.role = newRole;
```

Likewise, activating or deactivating a user is performed through:

```ts
UserService.toggleUserActive(user.id);
```

This keeps user-management rules in the Service layer.

---

## Responsibilities

### UsersIndexView

The View is responsible for:

```text
Rendering user information
Showing statistics
Handling role filter state
Showing buttons
Requesting confirmation
Calling UserService
```

The View is not responsible for:

```text
Directly modifying UserStore
Changing persisted state manually
Implementing authentication rules
```

---

### UserService

`UserService` is responsible for:

```text
Retrieving users
Retrieving a user by ID
Retrieving the current user
Checking authentication
Changing roles
Changing active state
Login
Logout
```

This allows other parts of the application to reuse the same user logic without directly depending
on Pinia.

---

### UserStore

`UserStore` keeps the user state used by the application.

Conceptually:

```text
UserStore
├── users[]
└── currentUserId
```

The Store represents the shared reactive user state.

Changes made by `UserService` are reflected in the Store and are later persisted by the existing
Pinia/localStorage configuration.

---

## User Listing

Users are obtained through:

```ts
UserService.getUsers()
```

The View does not access:

```ts
useUserStore().users
```

directly.

The user collection is passed to `GenericTable`.

The table displays the following columns:

```text
Nombre
Correo
Rol
Estado
Registro
```

---

## GenericTable

The reusable table component was renamed from:

```text
TablaGenerica.vue
```

to:

```text
GenericTable.vue
```

This keeps source-code naming consistent with the rest of the project.

Examples of the naming convention include:

```text
UserService
AccountService
AccountInterface
DashboardView
GenericTable
```

The visible user-interface labels continue to use Spanish.

For example:

```text
Acciones
Sin usuarios
No hay usuarios que coincidan con el filtro
```

remain valid UI text.

---

## Role Filter

The administrative view includes a reusable role filter.

The available options are:

```ts
const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
];
```

The selected value is stored in:

```ts
fRole
```

The filtered user collection is derived with a computed property.

Conceptually:

```text
All users
    |
    v
Is a role selected?
    |
  +---+---+
  |       |
 No      Yes
  |       |
  v       v
Return   Filter by role
all
```

This keeps the displayed user collection reactive.

---

## Role Change

The role-change action determines the opposite role:

```text
admin -> user
user  -> admin
```

Conceptually:

```ts
const newRole =
  user.role === 'admin'
    ? 'user'
    : 'admin';
```

Before applying the change, the View asks for confirmation.

If confirmed:

```ts
UserService.updateUserRole(
  user.id,
  newRole,
);
```

is called.

The Service is responsible for updating the user stored in Pinia.

---

## Active / Inactive State

ADMIN-23 requires administrators to activate and deactivate users.

A user contains:

```ts
active: boolean;
```

The displayed value is:

```text
true  -> Activo
false -> Inactivo
```

The View calls:

```ts
UserService.toggleUserActive(user.id);
```

instead of directly modifying the user object.

---

## toggleUserActive

The new Service method conceptually performs:

```ts
static toggleUserActive(id: number): void {
  const user = this.getUserById(id);

  if (!user) {
    return;
  }

  user.active = !user.active;
  user.updatedAt = new Date().toISOString();
}
```

The important operation is:

```ts
user.active = !user.active;
```

which produces:

```text
true  -> false
false -> true
```

The View does not need to know how the user is stored internally.

---

## Authentication Integration

Inactive-account authentication was already implemented in AUTH-14.

`UserService.login()` checks:

```ts
if (!user.active) {
  return {
    ok: false,
    error: 'Tu cuenta se encuentra inactiva.',
  };
}
```

Therefore the complete flow between ADMIN-23 and AUTH-14 is:

```text
Administrator
      |
      v
Deactivates user
      |
      v
UserService.toggleUserActive()
      |
      v
active = false
      |
      v
Pinia persists state
      |
      v
User attempts login
      |
      v
UserService.login()
      |
      v
active === false
      |
      v
Login rejected
```

No additional login logic was required in ADMIN-23.

---

## Current Administrator Protection

The current administrator cannot modify their own administrative access from the table.

The View disables the role and active-state buttons when:

```ts
user.id === currentUser?.id
```

This prevents the current admin from accidentally:

```text
Removing their own admin role
Deactivating their own account
```

This is an additional safety behavior beyond the core issue requirements.

---

## Admin Route Protection

The `/users` route contains:

```ts
meta: {
  admin: true,
}
```

The router uses the current authenticated user to determine access.

Conceptually:

```text
Navigate to /users
      |
      v
to.meta.admin === true
      |
      v
Get current user
      |
      v
role === admin?
   /        \
 yes        no
  |          |
  v          v
/users       /
```

A normal user should therefore be redirected to the dashboard if they manually attempt to access:

```text
/users
```

---

## Router Responsibility

Role-based navigation belongs to Vue Router rather than `UsersIndexView`.

The View assumes that if it is rendered, the router has already authorized the user.

This keeps authorization separate from UI rendering.

---

## Statistics

The view keeps the existing summary statistics:

```text
Usuarios totales
Administradores
```

They are derived from the user collection through a computed property.

Conceptually:

```ts
const stats = computed(() => {
  const users = UserService.getUsers();

  return {
    total: users.length,
    admins: users.filter(
      (user) => user.role === 'admin',
    ).length,
  };
});
```

This keeps derived values reactive without storing duplicate state.

---

## Removed Artificial Loading State

The previous view contained:

```ts
const loading = ref(true);

onMounted(() =>
  setTimeout(
    () => (loading.value = false),
    450,
  ),
);
```

This represented an artificial loading delay.

`UserService.getUsers()` currently reads data synchronously from Pinia, so the View is not waiting
for an API request.

The artificial delay was removed.

This simplifies the View and prevents the table from showing a loading skeleton when no actual
asynchronous operation exists.

If user data is later retrieved from a remote API, a real loading state can be introduced at that
time.

---

## User Row Typing

`GenericTable` is designed to work with generic row data.

The Users View uses a small helper:

```ts
function asUser(row: unknown): UserInterface {
  return row as UserInterface;
}
```

This allows the View to treat a generic table row as a `UserInterface` without modifying
`GenericTable` specifically for users.

The table therefore remains reusable for:

```text
Users
Accounts
Transactions
Reports
```

---

## Creation Date

The user's creation date is displayed using the existing formatter:

```ts
formatDate(...)
```

This avoids duplicating date-formatting logic inside the View.

---

## Acceptance Criteria Status

| Criterion | Status | Notes |
| --- | --- | --- |
| `UsersIndexView.vue` exists | Complete | Existing users view was renamed/migrated. |
| Route accessible only to administrators | Complete | `/users` uses `meta.admin` and router guard. |
| Display name | Complete | Dedicated table column. |
| Display email | Complete | Dedicated table column. |
| Display role | Complete | Role badge shown. |
| Display active state | Complete | Active/inactive badge shown. |
| Display creation date | Complete | Uses existing date formatter. |
| Use reusable table component | Complete | `GenericTable.vue` is used. |
| Filter users by role | Complete | Uses `SelectorFiltro`. |
| Change user role | Complete | Uses `UserService.updateUserRole()`. |
| Activate/deactivate user | Complete | Uses `UserService.toggleUserActive()`. |
| Inactive user cannot log in | Complete | Integrated with existing AUTH-14 behavior. |
| No direct Store access from View | Complete | All user operations go through `UserService`. |
| Responsive | Complete | Existing responsive structure preserved. |

---

## Manual Validation

### Admin Access

Initial state:

```text
Authenticated user
role = admin
```

Action:

```text
Navigate to /users
```

Expected:

```text
UsersIndexView is displayed.
```

Result:

```text
Passed
```

---

### Non-Admin Access

Initial state:

```text
Authenticated user
role = user
```

Action:

```text
Navigate manually to /users
```

Expected:

```text
Router redirects to dashboard.
```

Result:

```text
Verify before merge.
```

---

### Role Filter

Action:

```text
Select Administrador
```

Expected:

```text
Only admin users are displayed.
```

Action:

```text
Select Usuario
```

Expected:

```text
Only standard users are displayed.
```

Action:

```text
Select Todos los roles
```

Expected:

```text
All users are displayed.
```

Result:

```text
Passed / verify once more before merge.
```

---

### Change Role

Initial state:

```text
User role = user
```

Action:

```text
A admin
```

Expected:

```text
Confirmation
        |
        v
UserService.updateUserRole()
        |
        v
role = admin
```

Result:

```text
Verify before merge.
```

The reverse change should also work:

```text
admin -> user
```

---

### Deactivate User

Initial state:

```text
active = true
```

Action:

```text
Desactivar
```

Expected:

```text
Confirmation
        |
        v
UserService.toggleUserActive()
        |
        v
active = false
```

The UI should display:

```text
Inactivo
```

Result:

```text
Verify before merge.
```

---

### Inactive Login

After deactivating a user:

```text
Logout admin
        |
        v
Attempt login using inactive user
```

Expected:

```text
Tu cuenta se encuentra inactiva.
```

Result:

```text
Verify before merge.
```

---

### Reactivate User

Action:

```text
Admin logs in again
        |
        v
Activate user
```

Expected:

```text
active = true
```

The user should then be able to authenticate normally again.

---

### Current Administrator Protection

For the currently authenticated admin:

```text
Change role button -> disabled
Active-state button -> disabled
```

Expected:

```text
Administrator cannot remove their own role or deactivate themselves from the table.
```

Result:

```text
Passed if buttons appear disabled.
```

---

## Files Involved

Primary ADMIN-23 files:

```text
frontend/src/views/UsersIndexView.vue
frontend/src/services/UserService.ts
frontend/src/router/index.ts
```

Shared component rename:

```text
frontend/src/components/shared/TablaGenerica.vue
    ->
frontend/src/components/shared/GenericTable.vue
```

Existing dependencies used:

```text
frontend/src/components/shared/SelectorFiltro.vue
frontend/src/components/shared/StatCard.vue
frontend/src/interfaces/UserInterface.ts
frontend/src/stores/userstore.ts
frontend/src/PiniaConfig.ts
frontend/src/utils/formatters.ts
```

---

## Concepts Used

The implementation intentionally uses concepts already present in the course tutorials and the
existing FinZen architecture:

```text
<script setup lang="ts">
ref
computed
v-if
v-for
Vue components
Props / slots
Services
Stores
Interfaces
Array.filter()
Array.map()
Simple functions
Conditionals
Vue Router
Router metadata
```

No additional architectural layer was introduced.

---

## Remaining Follow-Up Before Merge

### 1. Verify Admin Guard

Log in as a normal user and manually navigate to:

```text
/users
```

Confirm that Vue Router redirects to:

```text
/
```

---

### 2. Verify Role Change

Test:

```text
user -> admin
admin -> user
```

and confirm the table updates.

---

### 3. Verify Active-State Integration

Test:

```text
Active
    ->
Inactive
```

then attempt login with that account.

The inactive account must be rejected.

Afterward reactivate the account and confirm login works again.

---

### 4. Verify Responsive Behavior

Check the page on a narrow viewport.

The table should remain usable, with horizontal scrolling where necessary, and action buttons
should remain accessible.

---

### 5. Search for Old Component References

After renaming the generic table component, search the project for:

```text
TablaGenerica
```

No stale import or component reference should remain.

All consumers should use:

```text
GenericTable
```

---

### 6. Review Final Diff

Run:

```bash
git status
```

and:

```bash
git diff
```

Confirm that the branch contains only ADMIN-23 and directly related shared-component changes.

---

### 7. Run Quality Checks

Run:

```bash
npm run lint
npm run type-check
npm run build
```

If the repository still reports known unrelated legacy errors, distinguish those from errors
introduced by ADMIN-23.

No new user-management error should remain unresolved.

---

## Result

ADMIN-23 now provides the administrative user-management flow:

```text
UsersIndexView
      |
      v
UserService
      |
      v
UserStore
```

Administrators can:

```text
List users
Filter by role
View roles
View active state
Change roles
Activate users
Deactivate users
```

Role-based page access remains controlled by Vue Router:

```text
/users
   |
   v
admin guard
```

Inactive-user authentication remains controlled by the existing AUTH-14 login logic:

```text
active = false
      |
      v
UserService.login()
      |
      v
Login rejected
```

The implementation therefore keeps user administration, authentication, routing, and shared state
separated according to the current FinZen layered architecture.