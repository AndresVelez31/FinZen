# ACCOUNTS-20: Implement AccountsIndexView

## Status

Implemented.

The accounts index view was migrated from the legacy `@/store` implementation to the architecture
currently required by FinZen:

```text
View -> Service -> Store
```

The view now retrieves accounts through `AccountService`, calculates the current balance through
`AccountService.getAccountBalance(id)`, supports account creation and editing navigation, supports
account deletion with a warning, provides an empty state, and preserves the existing responsive
layout.

One acceptance criterion remains affected by a domain-model inconsistency: the issue requests a
masked account number, but the canonical `Account` model explicitly does not contain
`accountNumber` or `bank`.

No artificial account number was generated in the View because doing so would introduce data that
does not exist in the domain model.

---

## Context

The project already contained an accounts view, originally named:

```text
AccountsView.vue
```

The view contained the visual structure required for listing accounts, but it still depended on the
removed legacy module:

```ts
@/store
```

It also referenced old account properties such as:

```text
bank
accountNumber
initialBalance
```

These properties are not part of the current `AccountInterface`.

The current domain model defines an account using:

```text
id
userId
name
type
balance
createdAt
updatedAt
```

Therefore, ACCOUNTS-20 required migrating the existing view to the current Service-based
architecture without reintroducing fields that no longer belong to the domain.

---

## What Was Done

- Renamed the existing accounts listing view to:

```text
AccountsIndexView.vue
```

- Updated the router reference to use `AccountsIndexView.vue`.
- Removed the legacy `@/store` dependency from the accounts index.
- Connected the view to `AccountService.getAccounts()`.
- Used `AccountService.getAccountBalance(id)` to display the calculated current balance.
- Preserved the existing responsive card-based account layout.
- Displayed the account `name` as the visible account/entity name.
- Displayed the account `type`.
- Added navigation to:

```text
/accounts/new
```

for account creation.

- Added navigation to:

```text
/accounts/:id/edit
```

for account editing.

- Connected account deletion to:

```ts
AccountService.deleteAccount(id)
```

- Added a confirmation warning before account deletion.
- Preserved the empty state when the current user has no accounts.
- Migrated `AccountFormView.vue` away from the legacy `@/store` implementation so the New and Edit
  buttons can be tested.
- Connected account creation to:

```ts
AccountService.createAccount()
```

- Connected account editing to:

```ts
AccountService.updateAccount()
```

- Used `AccountService.getAccountById()` to load an account during editing.
- Converted the route parameter to a number before requesting the account.
- Removed obsolete form fields that do not exist in the current domain model.
- Preserved the account type selector already present in the visual design.
- Clarified the difference between the stored/base balance and the calculated current balance.

---

## Architecture

The accounts index now follows:

```text
AccountsIndexView
        |
        v
AccountService
        |
        +----------------+
        |                |
        v                v
AccountStore      TransactionStore
```

The View does not directly import:

```text
useAccountStore()
useTransactionStore()
```

Instead, it requests information from `AccountService`.

For example:

```ts
AccountService.getAccounts()
```

is responsible for obtaining the current user's accounts.

Similarly:

```ts
AccountService.getAccountBalance(account.id)
```

is responsible for calculating the account's current balance.

---

## View -> Service -> Store Decision

The accounts view should not know how accounts are stored internally.

The correct relationship is:

```text
View
  |
  v
Service
  |
  v
Store
```

This keeps the View focused on presentation and user interaction.

For example:

```text
AccountsIndexView
        |
        | "Give me the accounts"
        v
AccountService.getAccounts()
        |
        v
AccountStore
```

The same approach is used for account balance calculations:

```text
AccountsIndexView
        |
        | account.id
        v
AccountService.getAccountBalance(id)
        |
        +----------------------+
        |                      |
        v                      v
AccountStore            TransactionStore
```

This keeps calculation logic outside the View.

---

## Account Listing

Accounts are obtained through:

```ts
AccountService.getAccounts()
```

The result represents the accounts belonging to the currently authenticated user.

The View then renders the collection using Vue's `v-for`.

Conceptually:

```text
AccountService.getAccounts()
        |
        v
accounts
        |
        v
v-for
        |
        v
Account cards
```

Each card shows:

```text
Account name
Account type
Calculated current balance
Edit action
Delete action
```

---

## Current Balance

The issue explicitly requires the account balance to be calculated through:

```ts
AccountService.getAccountBalance(id)
```

The View therefore does not simply display:

```ts
account.balance
```

as the current balance.

The Service calculates:

```text
Stored account balance
        +
Income transactions
        -
Expense / outgoing transactions
        =
Current calculated balance
```

For example:

```text
Stored/base balance:       5,000,000
Transaction delta:        -1,940,000
                          ----------
Current balance:           3,060,000
```

The accounts index therefore displays:

```text
Saldo actual
$3.060.000
```

while the account edit form can still display the stored/base balance:

```text
Saldo base
$5.000.000
```

These values are intentionally different.

---

## Base Balance vs. Current Balance

The `balance` stored inside `AccountInterface` represents the base value used by the calculation.

The current balance is obtained using:

```ts
AccountService.getAccountBalance(id)
```

The edit form must not replace the stored balance with the calculated balance when it is opened.

Doing so would cause transactions to be applied twice.

For example, this would be incorrect:

```text
Current calculated balance = 3,060,000

Save 3,060,000 as new base
        |
        v
Apply the same transactions again
        |
        v
Incorrect balance
```

For this reason, the account form edits:

```ts
account.balance
```

while the account list displays:

```ts
AccountService.getAccountBalance(account.id)
```

The form label was therefore clarified conceptually as:

```text
Saldo base
```

rather than treating it as the already-calculated current balance.

---

## Money Formatting

Account balances are displayed in Colombian pesos using:

```ts
Intl.NumberFormat
```

The implementation follows the same general approach used in the course tutorials for formatting
monetary values.

Example:

```ts
function formatToCOP(value: number): string {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(value);
}
```

This converts values such as:

```text
3060000
```

into a user-friendly representation such as:

```text
$3.060.000
```

---

## New Account Navigation

The accounts index provides a New Account action that navigates to:

```text
/accounts/new
```

The navigation is handled through Vue Router.

The account form detects that it is not editing an existing account and creates a new account using:

```ts
AccountService.createAccount()
```

The flow is:

```text
AccountsIndexView
        |
        | New Account
        v
/accounts/new
        |
        v
AccountFormView
        |
        v
AccountService.createAccount()
        |
        v
AccountStore
```

After successful creation, navigation returns to:

```text
/accounts
```

---

## Edit Account Navigation

The Edit action navigates to:

```text
/accounts/:id/edit
```

For example:

```text
/accounts/1/edit
```

The account form obtains the ID from:

```ts
route.params.id
```

Route parameters are strings, while account IDs are numbers.

Therefore the value is converted using:

```ts
const accountId = Number(route.params.id);
```

The account is then obtained through:

```ts
AccountService.getAccountById(accountId)
```

This follows the same route-parameter pattern used in the course tutorials.

---

## Edit Account Flow

The editing flow is:

```text
AccountsIndexView
        |
        | Edit
        v
/accounts/:id/edit
        |
        v
AccountFormView
        |
        v
Number(route.params.id)
        |
        v
AccountService.getAccountById(id)
        |
        v
Form receives account values
```

When the user submits the form:

```text
AccountFormView
        |
        v
AccountService.updateAccount(id, dto)
        |
        v
AccountStore
        |
        v
/accounts
```

---

## Account Form Domain Alignment

The previous legacy form contained:

```text
bank
accountNumber
initialBalance
```

These fields were removed because they do not exist in the current canonical account model.

The form now works with:

```text
name
type
balance
```

which matches `AccountInterface`.

Conceptually:

```ts
form = {
  name: '',
  type: 'Ahorros',
  balance: 0,
}
```

This prevents the View from creating fields that the Service and domain model do not support.

---

## Account Types

The form preserves the visual account type selector.

The account types currently used include values such as:

```text
Corriente
Ahorros
Efectivo
Digital
Inversión
```

The selector associates each displayed type with its corresponding value.

The existing visual icons are preserved as presentation details and do not affect the domain model.

The selected value is stored in:

```ts
form.type
```

---

## Account Creation

When the form is opened from:

```text
/accounts/new
```

no existing account is loaded.

The form submits a `CreateAccountDTO` through:

```ts
AccountService.createAccount(accountData)
```

The Service is responsible for generating values that do not belong to the form, including:

```text
id
userId
createdAt
updatedAt
```

This keeps account creation logic outside the View.

---

## Account Update

When editing an account, the View sends the allowed changes through:

```ts
AccountService.updateAccount(accountId, accountData)
```

The Service is responsible for locating and updating the account.

The View does not directly modify:

```ts
useAccountStore().accounts
```

---

## Account Deletion

The Delete button first displays a warning before modifying the account collection.

The warning explicitly informs the user that associated transactions will also be deleted.

Conceptually:

```text
User clicks Delete
        |
        v
Confirmation
        |
   +----+----+
   |         |
Cancel     Confirm
   |         |
   v         v
Nothing   AccountService.deleteAccount(id)
             |
             +------------------+
             |                  |
             v                  v
       Remove account     Remove transactions
```

The actual deletion logic remains inside:

```ts
AccountService.deleteAccount(id)
```

rather than inside the View.

---

## Associated Transactions

`AccountService.deleteAccount(id)` also removes transactions whose:

```ts
transaction.accountId
```

matches the deleted account.

This behavior is why the user must receive a warning before confirmation.

The View does not directly manipulate transaction data.

---

## Empty State

When:

```ts
accounts.length === 0
```

the account grid is not displayed.

Instead, the View presents an empty state explaining that no accounts exist yet and provides an
action to create the first account.

Conceptually:

```text
No accounts
     |
     v
"Aún no tienes cuentas"
     |
     v
Crear cuenta
```

This prevents the View from displaying an unexplained blank area.

---

## Responsive Layout

The existing responsive card layout was preserved.

The account list uses a grid that automatically adapts to the available screen width.

Conceptually:

```text
Desktop
[Account] [Account] [Account]

Tablet
[Account] [Account]

Mobile
[Account]
[Account]
```

The account form also adjusts its type selector and actions for smaller screens.

---

## Domain Model Conflict

### Issue Requirement

ACCOUNTS-20 requests each account card to display:

```text
Bank name
Account type
Masked account number
Calculated balance
```

### Canonical Domain Model

The current `AccountInterface` and domain documentation define:

```text
id
userId
name
type
balance
createdAt
updatedAt
```

The canonical domain model explicitly does not define:

```text
bank
accountNumber
initialBalance
```

Therefore, the acceptance criterion for a masked account number cannot currently be implemented
without changing the domain model.

---

## Decision: Do Not Fabricate Account Numbers

No fake account number is generated from:

```text
account.id
```

or any other unrelated field.

For example, this was intentionally avoided:

```text
**** 0001
```

if no real account number exists in the domain data.

Generating such a value would make the interface display information that is not actually stored by
the application.

Instead:

```text
account.name
```

is used as the visible account/entity name.

Examples from the current seed data include:

```text
Bancolombia
Davivienda
Nequi
Banco de Bogotá
```

The account number requirement remains documented as a domain-model inconsistency.

---

## Domain Change Procedure

If the team decides that accounts must contain a real account number, the change should not begin
inside `AccountsIndexView.vue`.

The expected propagation would be:

```text
docs/domain-model.md
        |
        v
AccountInterface
        |
        v
CreateAccountDTO / UpdateAccountDTO
        |
        v
Account seed data
        |
        v
AccountService
        |
        v
AccountFormView
        |
        v
AccountsIndexView
```

Only after the model contains an account number should the View implement masking.

---

## Acceptance Criteria Status

| Criterion | Status | Notes |
| --- | --- | --- |
| `AccountsIndexView.vue` exists | Complete | Existing accounts listing was renamed/migrated. |
| Display all accounts for current user | Complete | Data is obtained through `AccountService.getAccounts()`. |
| Show visible account/entity name | Complete | `account.name` is used according to the current model. |
| Show account type | Complete | `account.type` is displayed. |
| Show masked account number | Blocked by domain model | `accountNumber` is explicitly absent from the canonical model. |
| Calculate balance with `AccountService.getAccountBalance(id)` | Complete | Current balance is calculated by the Service. |
| New Account navigates to `/accounts/new` | Complete | Route integration is present. |
| Edit navigates to `/accounts/:id/edit` | Complete | Account ID is provided through the route. |
| Delete account | Complete | Uses `AccountService.deleteAccount(id)`. |
| Warn about associated transactions | Complete | Confirmation occurs before deletion. |
| Empty state | Complete | Displayed when the user has no accounts. |
| Responsive layout | Complete | Existing responsive grid/form styling is preserved. |

---

## Manual Validation

### Account List

Expected:

```text
Current user's accounts are displayed.
```

Each account shows:

```text
Name
Type
Calculated current balance
Edit
Delete
```

Result:

```text
Passed
```

---

### Calculated Balance

Example account:

```text
Bancolombia
```

Stored/base balance:

```text
5,000,000
```

Calculated current balance:

```text
3,060,000
```

The index correctly displays the calculated value while the edit form retains the base balance.

Result:

```text
Passed
```

---

### Edit Account

Action:

```text
/accounts
        |
        v
Edit account
        |
        v
/accounts/:id/edit
```

Expected:

- Existing account is loaded.
- Name is populated.
- Type is populated.
- Base balance is populated.
- Changes can be saved.
- User returns to `/accounts`.

Result:

```text
Passed
```

---

### Create Account

Action:

```text
/accounts/new
```

Expected:

- Empty creation form.
- User enters name, type, and base balance.
- Account is created through `AccountService`.
- User returns to `/accounts`.
- New account appears in the list.

Result:

```text
Pending final/manual confirmation before merge if not already tested.
```

---

### Delete Account

Action:

```text
Delete
```

Expected:

```text
Warning
        |
        +---- Cancel -> account remains
        |
        +---- Confirm -> account and associated transactions are removed
```

Result:

```text
Passed / verify once more before merge.
```

---

### Empty State

Expected when no accounts are available:

```text
Aún no tienes cuentas
```

with an action to create a new account.

Result:

```text
Pending final/manual confirmation before merge if not already tested.
```

---

### Responsive Behavior

Expected:

```text
Cards reorganize according to available width.
Form remains usable on narrow screens.
```

Result:

```text
Pending final visual confirmation before merge.
```

---

## Files Involved

Primary ACCOUNTS-20 files:

```text
frontend/src/views/AccountsIndexView.vue
frontend/src/views/AccountFormView.vue
frontend/src/router/index.ts
```

Existing dependencies used without requiring architectural changes:

```text
frontend/src/services/AccountService.ts
frontend/src/interfaces/AccountInterface.ts
frontend/src/dtos/CreateAccountDTO.ts
frontend/src/dtos/UpdateAccountDTO.ts
frontend/src/stores/accountstore.ts
frontend/src/stores/transactionstore.ts
```

The View does not directly depend on the Store files.

---

## Concepts Used

The implementation intentionally uses concepts already present in the course tutorials and existing
FinZen codebase:

```text
<script setup lang="ts">
ref
computed
v-if
v-for
v-model
v-model.number
@submit.prevent
RouterLink
useRoute
useRouter
route.params
Number()
Services
Interfaces
DTOs
Array methods
Intl.NumberFormat
Simple functions and conditionals
```

No additional architectural layer or unnecessary abstraction was introduced.

---

## Remaining Follow-Up Before Merge

### 1. Complete Manual Validation

Verify:

```text
Create
Edit
Delete
Delete cancellation
Empty state
Responsive behavior
```

---

### 2. Review the Final Diff

Run:

```bash
git status
```

and:

```bash
git diff
```

The issue should remain focused on accounts.

Avoid unrelated changes to other views, stores, or services.

---

### 3. Run Quality Checks

Run the repository's available quality commands:

```bash
npm run lint
npm run type-check
npm run build
```

If global checks fail because of known legacy files outside this issue, distinguish those errors
from errors introduced by ACCOUNTS-20.

No new Account-specific error should remain unresolved.

---

### 4. Preserve the Domain Conflict in the PR

The Pull Request should mention that:

```text
masked account number
```

was not implemented because the canonical domain model explicitly does not contain an account
number.

This should be reviewed as a domain requirement rather than solved by fabricating data in the View.

---

## Result

ACCOUNTS-20 migrates the accounts listing from the previous legacy implementation to the current
FinZen architecture:

```text
AccountsIndexView
        |
        v
AccountService
        |
        +-------------------+
        |                   |
        v                   v
AccountStore         TransactionStore
```

The view now supports:

```text
List accounts
Calculate current balance
Create account navigation
Edit account navigation
Delete account
Deletion warning
Empty state
Responsive layout
```

The Account form was also aligned with the current domain model so New and Edit actions can operate
through:

```text
AccountService.createAccount()
AccountService.updateAccount()
AccountService.getAccountById()
```

The only unresolved acceptance criterion is the masked account number because the current canonical
domain model explicitly excludes that property.

The implementation intentionally respects the domain model instead of introducing unsupported
account data directly from the View.