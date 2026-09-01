# DASHBOARD-17: Implement Financial Dashboard

## Status

Implemented, pending final validation.

The financial dashboard has been migrated to the current FinZen architecture and now follows:

```text
View -> Service -> Store
```

The dashboard provides:

- Total account balance.
- Current-month income.
- Current-month expenses.
- Current-month transaction count.
- Expense trend for the last six months.
- Five most recent transactions.
- Responsive layout.
- Empty-state support when no transactions exist.

All financial data is obtained through `AccountService` and `TransactionService`.

`DashboardView.vue` does not directly access Pinia stores.

Before closing the issue, the following final validations should be completed:

- Verify the dashboard empty state with a user that has no transactions.
- Ensure `savings` transactions are displayed as savings rather than expenses in the recent
  transactions table.
- Run the repository quality checks and distinguish pre-existing errors from DASHBOARD-17 errors.

---

## Context

The existing `DashboardView.vue` originally depended on the removed legacy:

```text
@/store
```

and contained financial calculations directly based on legacy exported state.

DASHBOARD-17 requires the dashboard to use the current layered architecture:

```text
DashboardView
      |
      v
Services
      |
      v
Pinia Stores
```

The issue specifically requires financial information to be obtained through:

```text
AccountService
TransactionService
```

without direct Store access from the View.

The required dashboard information includes:

```text
Total balance
Monthly income
Monthly expenses
Monthly transaction count
Six-month expense trend
Five recent transactions
```

---

## What Was Done

- Removed the legacy `@/store` dependency from `DashboardView.vue`.
- Connected the dashboard to `AccountService`.
- Connected the dashboard to `TransactionService`.
- Connected the dashboard to `UserService` for the current user's name.
- Used `AccountService.getTotalBalance()` for the total balance.
- Used `TransactionService.getTransactions()` for the current user's transactions.
- Derived current-month transactions with a `computed` property.
- Calculated current-month income with `filter()` and `reduce()`.
- Calculated current-month expenses with `filter()` and `reduce()`.
- Calculated the current-month transaction count.
- Selected the five most recent transactions with `slice(0, 5)`.
- Generated the last six calendar months.
- Calculated expenses for each of the last six months.
- Integrated `ChartGraphic.vue` for the expense trend.
- Integrated `GenericTable.vue` for recent transactions.
- Used `StatCard.vue` for dashboard KPIs.
- Added responsive layout behavior.
- Added dashboard empty-state behavior.
- Used the existing money and date formatters.
- Removed an invalid unused import from `ChartGraphic.vue` that prevented clean component usage.

---

## Architecture

The dashboard follows:

```text
DashboardView
      |
      +----------------------+
      |                      |
      v                      v
AccountService       TransactionService
      |                      |
      v                      v
AccountStore         TransactionStore
```

The current user is obtained through:

```text
DashboardView
      |
      v
UserService
      |
      v
UserStore
```

The View does not import:

```ts
useAccountStore()
useTransactionStore()
useUserStore()
```

directly.

---

## View Responsibility

`DashboardView.vue` is responsible for presentation and derived UI data.

Examples include:

```text
Rendering KPI cards
Rendering the chart
Rendering recent transactions
Showing the current user's name
Displaying an empty state
```

The View requests source data through Services and derives display information with `computed`.

---

## Service Responsibility

The Services are responsible for obtaining domain data.

### AccountService

The dashboard uses:

```ts
AccountService.getTotalBalance()
```

The View does not calculate individual account balances directly.

### TransactionService

The dashboard uses:

```ts
TransactionService.getTransactions()
```

This provides the transactions associated with the currently active user.

The Service is responsible for obtaining and ordering the transaction data before it reaches the
View.

---

## Current User

The dashboard greeting obtains the authenticated user through:

```ts
UserService.getCurrentUser()
```

Conceptually:

```text
UserService.getCurrentUser()
        |
        v
Current user
        |
        v
"Hola, Admin"
```

The View does not inspect `UserStore.currentUserId` directly.

---

## Transactions

The dashboard obtains transactions through:

```ts
const transactions = computed(() =>
  TransactionService.getTransactions(),
);
```

This provides the base collection used for the dashboard's derived calculations.

Conceptually:

```text
TransactionStore
       |
       v
TransactionService
       |
       v
Dashboard transactions
```

---

## Current Month

The current month is represented using the format:

```text
YYYY-MM
```

For example:

```text
2026-09
```

The value can be obtained from the current date using:

```ts
new Date().toISOString().slice(0, 7)
```

A transaction such as:

```text
2026-09-01
```

can then be compared using:

```ts
transaction.date.slice(0, 7)
```

which returns:

```text
2026-09
```

---

## Current-Month Transactions

The dashboard derives the current-month transactions with:

```text
All transactions
        |
        v
Compare YYYY-MM
        |
        v
Current-month transactions
```

Conceptually:

```ts
const monthTransactions = computed(() =>
  transactions.value.filter(
    (transaction) =>
      transaction.date.slice(0, 7) === currentMonth,
  ),
);
```

The result becomes the source for the monthly KPI calculations.

---

## Total Balance

The total balance is obtained through:

```ts
AccountService.getTotalBalance()
```

rather than calculating balances inside the View.

Conceptually:

```text
DashboardView
      |
      v
AccountService.getTotalBalance()
      |
      v
Calculated account balances
      |
      v
Total balance
```

Example displayed value:

```text
$15.859.000
```

The exact value depends on the account and transaction data currently stored in Pinia.

---

## Monthly Income

Monthly income is derived from the current-month transactions.

First:

```text
Current-month transactions
        |
        v
type === income
```

Then all income amounts are added using `reduce()`.

Conceptually:

```ts
monthTransactions
    .filter(type === 'income')
    .reduce(sum amounts)
```

Example:

```text
3,000,000
```

produces:

```text
Ingresos del mes
$3.000.000
```

---

## Monthly Expenses

Monthly expenses are derived in the same way:

```text
Current-month transactions
        |
        v
type === expense
        |
        v
Sum amounts
```

Only transactions explicitly identified as:

```text
expense
```

are included.

A transaction with:

```text
type = savings
```

is not counted as a monthly expense.

For example:

```text
Mercado             250,000
Gasolina              85,000
Internet             170,000
----------------------------
Monthly expenses     505,000
```

produces:

```text
Gastos del mes
$505.000
```

---

## Savings Behavior

The transaction domain supports a savings-type transaction.

A savings transaction represents money leaving the available account balance but should not
necessarily be categorized as consumption expense.

Therefore:

```text
expense -> included in monthly expenses
savings -> not included in monthly expenses
income  -> included in monthly income
```

The recent-transactions presentation must also distinguish:

```text
Ingreso
Gasto
Ahorro
```

instead of treating every non-income transaction as an expense.

This presentation detail should be verified before closing DASHBOARD-17.

---

## Monthly Transaction Count

The dashboard also displays the number of transactions recorded during the current month.

Conceptually:

```ts
monthTransactions.value.length
```

This includes all transaction types occurring during the month.

For example:

```text
1 income
3 expenses
1 savings
```

results in:

```text
Transacciones del mes
5
```

---

## Five Most Recent Transactions

`TransactionService.getTransactions()` provides transactions ordered from most recent to oldest.

The dashboard therefore obtains the latest five with:

```ts
transactions.value.slice(0, 5)
```

Conceptually:

```text
All transactions
ordered newest -> oldest
        |
        v
slice(0, 5)
        |
        v
Five recent transactions
```

No additional Store access or sorting logic is required in the View.

---

## Recent Transactions Table

Recent transactions are rendered using:

```text
GenericTable.vue
```

The displayed columns are:

```text
Description
Date
Type
Amount
```

The table uses slots to customize:

```text
Date formatting
Transaction-type labels
Amount formatting
Positive/negative presentation
```

Examples:

```text
Pago de nómina       Ingreso       + $3.000.000
Mercado mensual      Gasto         - $250.000
Ahorro del mes       Ahorro        - $400.000
```

The savings label must be verified before the issue is closed.

---

## Six-Month Expense Trend

DASHBOARD-17 requires an expense trend covering the last six months.

The View generates six calendar-month values beginning five months before the current month and
ending with the current month.

For September 2026, the range is:

```text
April
May
June
July
August
September
```

Internally, each month also has a key:

```text
2026-04
2026-05
2026-06
2026-07
2026-08
2026-09
```

---

## Generating the Last Six Months

The months are generated using:

```text
Date
for loop
push()
```

Conceptually:

```text
Current month
     |
     v
Go back five months
     |
     v
Generate six entries
     |
     v
Apr -> May -> Jun -> Jul -> Aug -> Sep
```

Each entry contains:

```text
key   -> YYYY-MM
label -> abbreviated month name
```

---

## Expense Trend Calculation

For each of the six months:

```text
Transactions
      |
      v
type === expense
      |
      v
date month === selected month
      |
      v
reduce amount
```

This produces one expense value per month.

Example:

```text
Apr    428,000
May    450,000
Jun    486,000
Jul    495,000
Aug    575,000
Sep    505,000
```

The exact values depend on the application's seeded and persisted data.

---

## ChartGraphic

The six-month expense data is rendered using:

```text
ChartGraphic.vue
```

The chart receives:

```text
labels
datasets
type
height
```

For DASHBOARD-17 the selected chart type is:

```text
line
```

The chart therefore receives no financial Store directly.

Its responsibility is only to visualize the data passed from the Dashboard.

---

## Chart Data Flow

```text
TransactionService
        |
        v
transactions
        |
        v
Dashboard computed calculations
        |
        v
expenseTrend
        |
        +-------------------+
        |                   |
        v                   v
labels                  dataset
        \                   /
         \                 /
          v               v
           ChartGraphic
```

This keeps chart rendering separated from financial data access.

---

## Shared Components

DASHBOARD-17 reuses existing shared components.

### StatCard

Used for:

```text
Total balance
Monthly income
Monthly expenses
Monthly transaction count
```

### ChartGraphic

Used for:

```text
Six-month expense trend
```

### GenericTable

Used for:

```text
Five recent transactions
```

This avoids duplicating UI structures inside `DashboardView.vue`.

---

## Empty State

The dashboard detects whether transaction data exists using a derived value equivalent to:

```ts
transactions.value.length > 0
```

When transactions exist:

```text
Chart
Recent transactions
```

are displayed.

When no transactions exist, the dashboard displays an empty state explaining that the user must
create their first transaction before financial trends can be displayed.

Conceptually:

```text
transactions.length
       |
   +---+---+
   |       |
  > 0      0
   |       |
   v       v
Dashboard Empty state
details
```

This behavior must be manually verified before closing the issue.

---

## Responsive Layout

The main dashboard content uses a responsive grid.

Desktop:

```text
+----------------------+ +----------------------+
| Expense trend        | | Recent transactions  |
|                      | |                      |
+----------------------+ +----------------------+
```

On narrower screens:

```text
+----------------------+
| Expense trend        |
+----------------------+

+----------------------+
| Recent transactions  |
+----------------------+
```

The KPI cards also use the existing shared responsive grid.

---

## Money Formatting

Financial values are displayed using the existing project formatter.

Examples:

```text
3000000
    |
    v
$3.000.000
```

This formatter is reused rather than recreating currency-formatting logic in the Dashboard.

---

## Date Formatting

Recent transaction dates are displayed using the existing date formatter.

Example:

```text
2026-09-01
      |
      v
1 de septiembre de 2026
```

The View reuses the shared formatter instead of implementing separate date formatting.

---

## Use of computed

The issue explicitly requires derived values to use Vue `computed`.

The dashboard uses computed properties for information such as:

```text
Current user
Transactions
Current-month transactions
Total balance
Monthly income
Monthly expenses
Transaction count
Recent transactions
Last six months
Expense trend
Transaction availability
```

This keeps the UI reactive to Store changes.

---

## Reactivity

Because Services obtain data from Pinia-backed Stores, changes to the underlying state can be
reflected in the Dashboard's computed values.

Conceptually:

```text
New transaction
      |
      v
TransactionStore changes
      |
      v
TransactionService result changes
      |
      v
computed values recalculate
      |
      v
Dashboard updates
```

The View does not manually synchronize duplicate KPI state.

---

## Test Data

Temporary seeded transactions were added during development to validate:

```text
Current-month income
Current-month expenses
Current-month transaction count
Six-month trend
Recent transactions
```

The test data included August and September 2026 transactions.

Example September test data included:

```text
Income       3,000,000
Expense        250,000
Expense         85,000
Expense        170,000
Savings        400,000
```

This allowed validation of:

```text
Monthly income       3,000,000
Monthly expenses       505,000
Transaction count            5
```

Whether these additional seed records remain in the final branch should be decided based on the
team's desired demo dataset.

They are not required by the DASHBOARD-17 architecture itself.

---

## LocalStorage Testing Note

FinZen persists Pinia state in browser `localStorage`.

Therefore, after modifying seed data, the existing:

```text
piniaState
```

entry may need to be removed before the new seed data appears.

Conceptually:

```text
Change seeder
    |
    v
Existing localStorage still has old state
    |
    v
Delete piniaState
    |
    v
Reload
    |
    v
Pinia initializes from updated seeders
```

This behavior is part of the existing persistence configuration and not specific to DASHBOARD-17.

---

## Acceptance Criteria Status

| Criterion | Status | Notes |
| --- | --- | --- |
| `DashboardView.vue` uses `<script setup lang="ts">` | Complete | Current Vue SFC structure is preserved. |
| Show total balance | Complete | Uses `AccountService.getTotalBalance()`. |
| Show current-month income | Complete | Derived from current-month income transactions. |
| Show current-month expenses | Complete | Derived from transactions where `type === 'expense'`. |
| Show current-month transaction count | Complete | Uses the current-month collection length. |
| Show six-month expense trend | Complete | Generated through computed monthly aggregation. |
| Use chart component | Complete | Uses `ChartGraphic.vue`. |
| Show five most recent transactions | Complete | Uses `TransactionService` result and `slice(0, 5)`. |
| Use `TransactionService` | Complete | No direct Transaction Store access. |
| Use `AccountService` | Complete | Total balance obtained through Service. |
| No direct Store access from View | Complete | Dashboard imports Services only. |
| Use `computed` for derived values | Complete | Used throughout dashboard calculations. |
| Responsive layout | Complete | Two-column layout collapses to one column. |
| Empty state when no transactions exist | Implemented, pending manual validation | Must be tested before merge. |
| Correct savings presentation | Pending final verification | Savings should display as `Ahorro`, not `Gasto`. |

---

## Manual Validation

### Total Balance

Expected:

```text
Balance total
$15.859.000
```

during the current test dataset.

Result:

```text
Passed
```

---

### Current-Month Income

Test transaction:

```text
Pago de nómina
type = income
amount = 3,000,000
date = 2026-09-01
```

Expected:

```text
Ingresos del mes
$3.000.000
```

Result:

```text
Passed
```

---

### Current-Month Expenses

September expense test data:

```text
Mercado        250,000
Gasolina        85,000
Internet       170,000
```

Expected:

```text
505,000
```

Result:

```text
Passed
```

---

### Monthly Transaction Count

September test data contains:

```text
1 income
3 expenses
1 savings
```

Expected:

```text
5
```

Result:

```text
Passed
```

---

### Six-Month Trend

Expected period:

```text
Apr
May
Jun
Jul
Aug
Sep
```

Expected:

```text
Line chart contains monthly expense values.
```

Result:

```text
Passed
```

---

### Recent Transactions

Expected:

```text
Five newest user transactions
```

Result:

```text
Passed
```

---

### Savings Display

Current requirement:

```text
type = savings
```

must be displayed as:

```text
Ahorro
```

rather than:

```text
Gasto
```

Result:

```text
Pending final verification before merge.
```

---

### Empty State

Required test:

```text
User with no transactions
```

Expected:

```text
Dashboard displays the no-transactions empty state.
```

Result:

```text
Pending manual validation.
```

---

### Responsive Behavior

Test:

```text
Reduce browser viewport below 900px.
```

Expected:

```text
Chart and recent transactions stack vertically.
```

Result:

```text
Passed visually / verify once more before merge.
```

---

## Files Involved

Primary DASHBOARD-17 file:

```text
frontend/src/views/DashboardView.vue
```

Shared components used:

```text
frontend/src/components/shared/StatCard.vue
frontend/src/components/shared/ChartGraphic.vue
frontend/src/components/shared/GenericTable.vue
```

Services used:

```text
frontend/src/services/AccountService.ts
frontend/src/services/TransactionService.ts
frontend/src/services/UserService.ts
```

Utilities used:

```text
frontend/src/utils/formatters.ts
```

Test/demo data may also include modifications to:

```text
frontend/src/stores/transactionseeder.ts
```

if the additional transactions are retained.

---

## Concepts Used

The implementation intentionally relies on concepts already used in the course tutorials and the
existing FinZen project:

```text
<script setup lang="ts">
computed
Services
Stores through Services
Array.filter()
Array.reduce()
Array.map()
Array.slice()
Date
for loops
v-if
Vue components
Props
Slots
Responsive CSS
Intl/date formatting through utilities
```

No new architectural layer was introduced.

---

## Remaining Follow-Up Before Merge

### 1. Correct Savings Presentation

Ensure that the recent-transactions table handles:

```text
income
expense
savings
```

separately.

Expected:

```text
income  -> Ingreso
expense -> Gasto
savings -> Ahorro
```

---

### 2. Test Empty State

Use a user with no transactions or temporarily clear the user's transactions.

Confirm the dashboard displays:

```text
Aún no tienes transacciones
```

instead of an empty chart/table area.

---

### 3. Decide Whether Test Transactions Remain

The August/September seed transactions were useful for manual dashboard validation.

Before merge, decide whether they should remain as part of the normal application demonstration
dataset.

If they were added only for temporary testing, remove them before the final commit.

---

### 4. Review Final Diff

Run:

```bash
git status
```

and:

```bash
git diff
```

Confirm that the branch is focused on DASHBOARD-17 and directly required shared-component fixes.

---

### 5. Run Quality Checks

Run:

```bash
npm run lint
npm run type-check
npm run build
```

Any DASHBOARD-specific errors should be resolved before merge.

If unrelated legacy errors remain elsewhere in the repository, document them separately rather than
expanding DASHBOARD-17 into unrelated refactoring work.

---

## Result

DASHBOARD-17 now follows the FinZen layered architecture:

```text
DashboardView
      |
      +----------------------+
      |                      |
      v                      v
AccountService       TransactionService
      |                      |
      v                      v
AccountStore         TransactionStore
```

The dashboard provides:

```text
Total financial balance
Current-month income
Current-month expenses
Current-month transaction count
Six-month expense trend
Five recent transactions
Responsive financial summary
Empty-state support
```

All business data is obtained through Services.

The View remains responsible for presentation and reactive derived values while Pinia Stores remain
hidden behind the Service layer.

The implementation therefore satisfies the core requirements of DASHBOARD-17, with only final
manual validation of the empty state and savings presentation remaining before merge.