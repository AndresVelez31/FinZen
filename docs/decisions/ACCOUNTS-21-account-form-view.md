# ACCOUNTS-21: Implement AccountFormView (Create & Edit modes)

> Historical note: the first implementation duplicated the balance rule in the View. The
> amendment below supersedes that validation placement while preserving the original delivery
> context.

## What was done

- Created `src/views/AccountFormView.vue` to replace the legacy version, which imported
  from the deleted `@/store` module and used the pre-refactor `bank` / `accountNumber` /
  `initialBalance` fields.
- Create mode (`/accounts/new`): renders a blank form and calls
  `AccountService.createAccount(dto)` with validated account data.
- Edit mode (`/accounts/:id/edit`): resolves the account via
  `AccountService.getAccountById(id)`, pre-fills the form, and calls
  `AccountService.updateAccount(id, dto)`. If the ID is invalid, absent, or unavailable to the
  active user, it redirects to `/accounts`.
- Consumes `AccountService.validateAccountData()` and maps its typed issue codes to local field
  messages; the View does not duplicate account business rules or trim domain data.
- Checks the result of `updateAccount()` and never reports success when it returns `undefined`.
- Wraps mutation calls in `try/catch`, shows SweetAlert2 feedback, and redirects to `/accounts`
  only after a successful mutation.
- Cancel button routes back to `/accounts` via the named route, not a hardcoded path.

## Decisions

### The issue's original field list (`bank`, `account number`, `initial balance`) is outdated

The acceptance criteria were written before `PR #38` (`refactor/domain-alignment`,
merged the same day) changed `AccountInterface` to `{ name, type, balance }` and
removed `accountNumber` entirely. Confirmed directly with the architect
(`AndresVelez31`) that this removal was intentional and permanent, not an oversight.
The form was built against the **current** interface: a single `name` field (replacing
"bank name"), `type`, and `balance` (used as the account's initial balance baseline —
`AccountService.getAccountBalance()` adds transaction deltas on top of it).

### Historical validation placement (superseded)

The initial implementation placed the `balance >= 0` check in the View because changing the shared
Service was outside that issue's original scope. That left integrity dependent on the UI and is no
longer the current design. The amendment below records the replacement.

### Historical error handling (superseded)

The initial View treated every thrown `Error.message` as display text. Field validation now uses a
typed result and a local message map. Operational mutation failures are still caught for
SweetAlert2 feedback.

## Amendment: Service-Owned Validation and Presentation-Only Form Logic

### 1. Validation and Sanitization Live in `AccountService`

The View builds a `CreateAccountDTO` from its input state and calls
`AccountService.validateAccountData()`. Converting the text input to a number (or to `NaN` when it
is blank) is an input-adaptation concern; the Service decides whether that value is valid.

The Service is the single authority for these rules:

- `name` is trimmed and must not be empty;
- `type` is required and must belong to the canonical catalogue;
- `balance` must be finite and greater than or equal to zero.

When validation succeeds, the View passes the sanitized `validationResult.value` to
`createAccount()` or `updateAccount()`. Both mutation methods validate again internally, so direct
Service callers receive the same protection. There is no `.trim()` or independent business-rule
implementation in `AccountFormView`.

### 2. Typed Codes Are Mapped to UI Messages

`AccountValidationResultDTO` is a discriminated result using `isValid`. Invalid results contain
`AccountValidationIssueDTO` entries with a field and a typed code:

```text
NAME_REQUIRED
TYPE_REQUIRED
TYPE_INVALID
BALANCE_INVALID
BALANCE_NEGATIVE
```

`AccountFormView` maps those codes through its exhaustive `VALIDATION_MESSAGES` record and stores
the resulting Spanish copy in local `FormErrors`. The Service determines validity; the View only
decides how each issue is presented. SweetAlert2, navigation, accessibility attributes, and the
`isSaving` state likewise remain UI responsibilities.

### 3. Canonical Values, Local Presentation Metadata

The canonical account types are:

```text
Corriente
Ahorros
Efectivo
Digital
Inversión
```

The View obtains this read-only list through `AccountService.getAccountTypes()`. Its local
`ACCOUNT_TYPE_ICONS` map attaches Lucide components, while labels and icons remain presentation
details. The form initializes with the valid `Corriente` value; the obsolete `checking` default is
no longer used.

### 4. User-Scoped Edit and Update Flow

The route ID is parsed as a positive integer before lookup. `AccountService.getAccountById()` only
returns an account owned by the active user, so invalid, unknown, and foreign IDs are unavailable
to the form and cause navigation back to `/accounts`.

The Service repeats the ownership condition during update. The View stores the returned account in
`updatedAccount`; if the result is `undefined`, it raises local error feedback and does not display
the success alert or navigate as though the update succeeded.

### 5. Submission and Route State

`isSaving` prevents duplicate submission and disables the form actions while a mutation is in
progress. A watcher with `immediate: true` reloads or resets the form when edit mode or the route ID
changes, allowing the shared View to handle both create and edit routes without stale local state.

## Validation

- Targeted `vue-tsc` validation for `AccountFormView.vue` and its account contracts passes.
- Targeted ESLint and OXLint checks for the modified account files pass.
