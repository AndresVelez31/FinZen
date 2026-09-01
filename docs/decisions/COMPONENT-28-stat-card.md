# COMPONENT-28: Implement Reusable StatCard Component

## Status

Complete.

`StatCard.vue` was standardized as a reusable component for displaying financial and summary
metrics across FinZen.

The component is currently reused in:

```text
DashboardView.vue
ReportsView.vue
UsersIndexView.vue
```

The component exposes a simple presentation-oriented contract and contains no business logic,
Service access, or Store access.

---

## Context

FinZen already contained a reusable `StatCard.vue` component inside:

```text
src/components/shared/StatCard.vue
```

The original component used props such as:

```text
label
value
icon
accent
trend
trendUp
```

COMPONENT-28 required a simpler reusable metric card based on:

```text
title
value
icon
variant
```

The component was therefore adjusted to provide a clearer API and avoid requiring each View to
manually choose presentation colors.

---

## Component Location

The issue references a reusable `StatCard.vue` component.

The project already organizes reusable UI components under:

```text
src/components/shared/
```

Therefore, the existing component was preserved at:

```text
src/components/shared/StatCard.vue
```

A second duplicate component was not created.

This keeps the reusable component structure consistent with:

```text
GenericTable.vue
ChartGraphic.vue
SelectorFilter.vue
StatCard.vue
```

---

## What Was Done

- Reused the existing `StatCard.vue`.
- Replaced the previous `label` prop with `title`.
- Preserved the `value` prop.
- Kept icon support.
- Added a `variant` prop for semantic presentation.
- Added support for:
  - `default`
  - `income`
  - `expense`
- Removed the need for Views to provide CSS accent variables manually.
- Removed unused trend-related props from the new component contract.
- Preserved responsive styling.
- Preserved compatibility with Lucide Vue icons.
- Updated Dashboard consumers to use `title`.
- Updated Reports consumers to use `title`.
- Updated Users consumers to use `title`.
- Removed old uses of `label`, `accent`, `trend`, and `trendUp` from `StatCard` consumers.

---

## Component Contract

The component now uses a typed contract similar to:

```ts
interface Props {
  title: string;
  value: string;
  icon?: string | Component;
  variant?: 'default' | 'income' | 'expense';
}
```

Default values are provided for optional props.

The main required data is:

```text
title
value
```

while:

```text
icon
variant
```

are optional presentation properties.

---

## title

The `title` prop represents the metric name displayed by the card.

Examples:

```text
Balance total
Ingresos del mes
Gastos del mes
Transacciones del mes
Ingresos totales
Balance neto
Usuarios totales
Administradores
```

Example usage:

```vue
<StatCard
  title="Balance total"
  value="$15.859.000"
/>
```

---

## value

The `value` prop represents the already-calculated value that should be displayed.

Examples:

```text
$15.859.000
$3.000.000
$505.000
5
2
1
```

`StatCard` does not calculate this value.

The View is responsible for providing the final formatted value.

For example:

```vue
<StatCard
  title="Gastos del mes"
  :value="formatToCOP(monthlyExpenses)"
/>
```

---

## icon

The component accepts an optional icon.

FinZen currently uses icons from:

```text
lucide-vue-next
```

Examples include:

```text
Wallet
TrendingUp
TrendingDown
List
UsersIcon
ShieldCheck
```

Example:

```vue
<StatCard
  title="Balance total"
  :value="formatToCOP(totalBalance)"
  :icon="Wallet"
/>
```

The component can also support a simple string icon when required.

This preserves compatibility with the existing FinZen visual design.

---

## variant

The `variant` prop controls the semantic presentation of the card.

Supported values are:

```text
default
income
expense
```

The default value is:

```text
default
```

Conceptually:

```text
default
  -> general metric

income
  -> positive/income metric

expense
  -> negative/expense metric
```

---

## Default Variant

Used for neutral metrics such as:

```text
Balance total
Transaction count
User count
Administrator count
```

Example:

```vue
<StatCard
  title="Transacciones del mes"
  :value="String(transactionCount)"
  :icon="List"
/>
```

---

## Income Variant

Used for positive financial metrics.

Example:

```vue
<StatCard
  title="Ingresos del mes"
  :value="formatToCOP(monthlyIncome)"
  :icon="TrendingUp"
  variant="income"
/>
```

The component decides how an income card should be visually represented.

The View does not need to provide a CSS color manually.

---

## Expense Variant

Used for expense-related metrics.

Example:

```vue
<StatCard
  title="Gastos del mes"
  :value="formatToCOP(monthlyExpenses)"
  :icon="TrendingDown"
  variant="expense"
/>
```

This separates semantic meaning from presentation details.

---

## Previous Accent Approach

The previous API required Views to provide values such as:

```vue
accent="var(--primary)"
```

or:

```vue
accent="var(--danger)"
```

This meant the View had to know presentation details.

Conceptually:

```text
View
  |
  | "Use this CSS color"
  v
StatCard
```

The new API uses:

```vue
variant="expense"
```

instead.

Conceptually:

```text
View
  |
  | "This metric is an expense"
  v
StatCard
  |
  v
Choose presentation
```

This produces a clearer reusable component contract.

---

## Separation of Responsibilities

`StatCard` is only responsible for presentation.

It receives:

```text
title
value
icon
variant
```

and renders a card.

It does not access:

```text
AccountService
TransactionService
ReportService
UserService
Pinia Stores
```

It also does not calculate:

```text
Balances
Income
Expenses
Transaction counts
User counts
```

Those values are calculated outside the component.

---

## Data Flow

Example with Dashboard:

```text
AccountService
      |
      v
DashboardView
      |
      | calculated/formatted value
      v
StatCard
      |
      v
Rendered metric
```

For monthly expenses:

```text
TransactionService
      |
      v
Dashboard computed
      |
      v
monthlyExpenses
      |
      v
formatToCOP()
      |
      v
StatCard
```

The component never needs access to the original transaction collection.

---

## Dashboard Integration

`DashboardView.vue` reuses `StatCard` for:

```text
Balance total
Ingresos del mes
Gastos del mes
Transacciones del mes
```

Example:

```vue
<StatCard
  title="Balance total"
  :value="formatToCOP(totalBalance)"
  :icon="Wallet"
/>

<StatCard
  title="Ingresos del mes"
  :value="formatToCOP(monthlyIncome)"
  :icon="TrendingUp"
  variant="income"
/>

<StatCard
  title="Gastos del mes"
  :value="formatToCOP(monthlyExpenses)"
  :icon="TrendingDown"
  variant="expense"
/>

<StatCard
  title="Transacciones del mes"
  :value="String(transactionCount)"
  :icon="List"
/>
```

---

## Reports Integration

`ReportsView.vue` reuses the same component for report metrics.

Examples include:

```text
Ingresos totales
Gastos totales
Balance neto
```

Example:

```vue
<StatCard
  title="Ingresos totales"
  :value="formatToCOP(summary.totalIncome)"
  :icon="TrendingUp"
  variant="income"
/>
```

and:

```vue
<StatCard
  title="Gastos totales"
  :value="formatToCOP(summary.totalExpense)"
  :icon="TrendingDown"
  variant="expense"
/>
```

---

## Dynamic Balance Variant

The report balance can dynamically choose its presentation.

Conceptually:

```text
netBalance >= 0
      |
      +---- yes -> income
      |
      +---- no  -> expense
```

Example:

```vue
<StatCard
  title="Balance neto"
  :value="formatToCOP(summary.netBalance)"
  :icon="Wallet"
  :variant="summary.netBalance >= 0 ? 'income' : 'expense'"
/>
```

This keeps the View responsible for determining the metric meaning while the component controls the
visual presentation.

---

## Users Integration

The same component can also represent non-financial summary metrics.

`UsersIndexView.vue` uses it for:

```text
Usuarios totales
Administradores
```

Example:

```vue
<StatCard
  title="Usuarios totales"
  :value="String(stats.total)"
  :icon="UsersIcon"
/>
```

and:

```vue
<StatCard
  title="Administradores"
  :value="String(stats.admins)"
  :icon="ShieldCheck"
/>
```

This confirms that `StatCard` is reusable beyond the financial Dashboard.

---

## Reusability

The intended relationship is:

```text
                  StatCard
                     |
         +-----------+-----------+
         |           |           |
         v           v           v
    Dashboard      Reports      Users
```

Each View provides its own:

```text
title
value
icon
variant
```

while `StatCard` controls the common card structure.

---

## Removed Props

The previous component supported:

```text
label
accent
trend
trendUp
```

These props were removed from the new contract because they were not required by COMPONENT-28.

### label

Replaced by:

```text
title
```

for consistency with the issue contract.

### accent

Replaced by:

```text
variant
```

so Views express semantic meaning rather than CSS implementation details.

### trend

Not required for the current acceptance criteria.

### trendUp

Not required once `trend` is removed.

---

## Consumer Migration

After changing:

```text
label
```

to:

```text
title
```

all consumers had to be updated.

For example, the previous usage:

```vue
<StatCard
  label="Balance total"
  ...
/>
```

would no longer provide the required `title`.

The corrected usage is:

```vue
<StatCard
  title="Balance total"
  ...
/>
```

This migration was required in:

```text
DashboardView.vue
ReportsView.vue
UsersIndexView.vue
```

---

## Rendering Issue Found During Validation

During visual testing, some cards displayed:

```text
icon
value
```

but no title.

The cause was that several Views were still passing:

```text
label
```

while the component expected:

```text
title
```

Once the consuming Views were updated to use `title`, the card titles rendered correctly.

This confirmed that the new prop contract was working as expected.

---

## Responsive Behavior

The component preserves responsive behavior.

The card uses flexible spacing and adjusts its value size on narrow screens.

Conceptually:

```text
Desktop

+---------------------------+
| Metric title        icon |
| $15.859.000              |
+---------------------------+
```

On smaller screens:

```text
+------------------+
| Title       icon |
| $15.8M           |
+------------------+
```

The surrounding responsive grid remains the responsibility of the consuming View.

---

## Theme Consistency

The component uses existing FinZen CSS variables.

Examples include:

```text
--primary
--danger
--text-muted
--surface
--shadow-md
```

This allows the card to remain consistent with:

```text
Light mode
Dark mode
Existing FinZen design system
```

No hardcoded application-specific color scheme is required in the View.

---

## No Domain Logic

The component intentionally does not contain code such as:

```ts
if (transaction.type === 'expense')
```

or:

```ts
AccountService.getTotalBalance()
```

or:

```ts
UserService.getUsers()
```

Those operations belong outside `StatCard`.

The component only interprets the generic presentation prop:

```text
variant
```

---

## TypeScript

The component uses typed props instead of untyped runtime values.

This improves:

```text
Autocomplete
Strict-mode validation
Component API documentation
Consumer consistency
```

For example, invalid values such as:

```text
variant="warning"
```

are rejected by TypeScript because valid values are only:

```text
default
income
expense
```

---

## Acceptance Criteria Status

| Criterion | Status | Notes |
| --- | --- | --- |
| Reusable `StatCard.vue` exists | Complete | Existing shared component reused. |
| `title: string` | Complete | Replaces previous `label`. |
| `value: string` | Complete | Displays final metric value. |
| Optional icon | Complete | Supports existing Lucide components and strings. |
| `variant` supported | Complete | `default`, `income`, `expense`. |
| Used in Dashboard | Complete | Four main dashboard metrics. |
| Used in Reports | Complete | Income, expenses, and balance metrics. |
| Consistent theme styling | Complete | Uses project CSS variables. |
| Responsive | Complete | Card adapts to narrow screens. |
| No domain logic | Complete | Presentation-only component. |
| Strict TypeScript props | Complete | Component contract explicitly typed. |

---

## Manual Validation

### Dashboard Balance Card

Expected:

```text
Balance total
$15.859.000
```

Result:

```text
Passed
```

---

### Dashboard Income Card

Expected:

```text
Ingresos del mes
$3.000.000
```

with positive/income presentation.

Result:

```text
Passed
```

---

### Dashboard Expense Card

Expected:

```text
Gastos del mes
$505.000
```

with expense presentation.

Result:

```text
Passed
```

---

### Dashboard Transaction Count

Expected:

```text
Transacciones del mes
5
```

Result:

```text
Passed
```

---

### Reports

Expected cards:

```text
Ingresos totales
Gastos totales
Balance neto
```

Result:

```text
Passed
```

---

### Users

Expected cards:

```text
Usuarios totales
Administradores
```

Result:

```text
Passed
```

---

### Title Rendering

Initial problem:

```text
Card value visible
Card icon visible
Card title missing
```

Cause:

```text
View still passed label
StatCard expected title
```

Correction:

```text
label -> title
```

Result:

```text
Passed
```

---

## Files Involved

Primary component:

```text
frontend/src/components/shared/StatCard.vue
```

Primary consumers:

```text
frontend/src/views/DashboardView.vue
frontend/src/views/ReportsView.vue
frontend/src/views/UsersIndexView.vue
```

No Store or Service modification is required by COMPONENT-28.

---

## Concepts Used

The component intentionally relies on concepts already used throughout FinZen and the course:

```text
<script setup lang="ts">
Interfaces
Props
withDefaults
Vue components
Dynamic component rendering
Conditional rendering
CSS variables
Responsive CSS
```

No additional architectural layer was introduced.

---

## Final Validation

Before merge, search the project for:

```text
<StatCard
```

and confirm that every consumer uses:

```text
title=
```

instead of:

```text
label=
```

Also search for obsolete StatCard props:

```text
accent=
trend=
trendUp=
```

No consumer should still depend on the previous contract.

Then run:

```bash
npm run lint
npm run type-check
npm run build
```

Any error introduced by the new `StatCard` contract should be resolved before merge.

---

## Result

COMPONENT-28 provides a single reusable metric card:

```text
StatCard
```

with the following contract:

```text
title
value
icon
variant
```

The component is reused across:

```text
Dashboard
Reports
Users
```

Its responsibility is limited to presentation.

Financial calculations, user statistics, Services, and Stores remain outside the component.

The final architecture is therefore:

```text
View
 |
 | prepared metric data
 v
StatCard
 |
 v
Reusable visual metric
```

COMPONENT-28 is complete.