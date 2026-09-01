# COMPONENT-26: Create SelectorFiltro Reusable Filter Component

## Status

Functionally complete.

The reusable `SelectorFiltro.vue` component is implemented and integrated into the existing
Transactions and Reports views.

The component now provides a strictly typed Vue 3 `v-model` contract and is reused for multiple
filtering scenarios instead of duplicating `<select>` logic in each view.

The implementation satisfies the functional acceptance criteria defined by COMPONENT-26.

Repository-wide type checking still reports pre-existing errors in legacy views and shared
components unrelated to this issue. These errors were not introduced by COMPONENT-26 and should be
handled by their corresponding migration/refactor issues.

---

## Context

The project already contained a visual `SelectorFiltro.vue` prototype inside:

```text
src/components/shared/SelectorFiltro.vue
```

However, the original component used loosely typed runtime props such as:

```ts
modelValue: {
  type: [String, Number],
}
```

and:

```ts
options: {
  type: Array,
}
```

This meant TypeScript could not guarantee the structure of the filter options or the type emitted
through `v-model`.

COMPONENT-26 requires a reusable filter component compatible with Vue's `v-model` convention and
strictly typed with TypeScript.

The required contract is:

```ts
options: {
  label: string;
  value: string;
}[];

modelValue: string;

placeholder?: string;
```

and the component must emit:

```text
update:modelValue
```

when the selected value changes.

---

## What Was Done

- Reused the existing `src/components/shared/SelectorFiltro.vue` component instead of creating a
  duplicate implementation.
- Added a strict `FilterOption` TypeScript interface.
- Added a strict `Props` TypeScript interface.
- Changed `modelValue` to accept only `string`.
- Typed `options` as `FilterOption[]`.
- Kept `placeholder` optional with a default value.
- Kept the optional `label` property already expected by existing views.
- Added a typed `update:modelValue` event.
- Replaced the untyped selection handler with an `Event`-typed handler.
- Validated the DOM event target as an `HTMLSelectElement` before reading its value.
- Preserved the existing visual styles used by the project.
- Updated account and activity filter options in Transactions so numeric IDs are converted to
  strings.
- Added the required month filter to Transactions.
- Integrated the month filter into the existing computed transaction filtering logic.
- Added the month filter to the active-filter counter.
- Added the month filter to the reset behavior.
- Kept existing type and account filters using the shared component.
- Preserved the additional activity filter already present in Transactions.
- Updated Reports month options to satisfy the strict `FilterOption` contract.
- Preserved the existing Reports month/year period filters using `SelectorFiltro`.

---

## Component Location Decision

The issue description references:

```text
src/components/SelectorFiltro.vue
```

The repository, however, already organizes reusable UI components under:

```text
src/components/shared/
```

Examples include:

```text
GraficoChart.vue
StatCard.vue
TablaGenerica.vue
SelectorFiltro.vue
```

Because `SelectorFiltro` is explicitly intended to be reused by multiple views, the existing
location was preserved:

```text
src/components/shared/SelectorFiltro.vue
```

This avoids introducing two components with the same responsibility:

```text
components/SelectorFiltro.vue
components/shared/SelectorFiltro.vue
```

which could otherwise diverge over time.

The shared location also keeps imports consistent with the rest of the reusable UI components.

---

## Component Contract

The component now defines:

```ts
interface FilterOption {
  label: string;
  value: string;
}

interface Props {
  label?: string;
  modelValue: string;
  options: FilterOption[];
  placeholder?: string;
}
```

Defaults are provided through:

```ts
withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Todos',
});
```

This provides a clear and predictable API to every consuming view.

---

## Why FilterOption Uses Strings

The acceptance criteria require:

```ts
{
  label: string;
  value: string;
}
```

for every option.

For example:

```ts
const typeOptions = [
  {
    label: 'Ingreso',
    value: 'income',
  },
  {
    label: 'Gasto',
    value: 'expense',
  },
];
```

The user sees:

```text
Ingreso
Gasto
```

while the application works internally with:

```text
income
expense
```

Using one value type for the component simplifies the `v-model` contract and prevents the component
from returning different types depending on the filter being used.

---

## v-model Integration

The central requirement of COMPONENT-26 is compatibility with Vue's `v-model`.

A consuming view can write:

```vue
<SelectorFiltro
  v-model="selectedType"
  :options="typeOptions"
/>
```

Conceptually, Vue expands this into:

```vue
<SelectorFiltro
  :modelValue="selectedType"
  @update:modelValue="selectedType = $event"
  :options="typeOptions"
/>
```

Therefore, the reusable component needs two pieces:

```text
modelValue
```

to receive the current value, and:

```text
update:modelValue
```

to communicate a new value back to the parent.

---

## Typed Event Emission

The component declares:

```ts
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
```

This means the component can emit:

```text
update:modelValue
```

and the emitted value must be a string.

For example:

```ts
emit('update:modelValue', 'expense');
```

is valid.

The complete interaction is:

```text
Parent state
selectedType = ""

        |
        v

SelectorFiltro receives
modelValue = ""

        |
        v

User selects "Gasto"

        |
        v

<select> value becomes "expense"

        |
        v

onChange()

        |
        v

emit(
  'update:modelValue',
  'expense'
)

        |
        v

Parent v-model receives event

        |
        v

selectedType = "expense"
```

This allows the shared component to remain stateless regarding the actual filtering behavior.

The parent view owns the filter state.

---

## Selection Handler

The change handler is typed as:

```ts
function onChange(event: Event): void
```

instead of using `any`.

The target is validated before accessing `.value`:

```ts
const target = event.target;

if (!(target instanceof HTMLSelectElement)) {
  return;
}
```

After validation:

```ts
emit('update:modelValue', target.value);
```

This keeps the component compatible with strict TypeScript rules and avoids unsafe DOM casts.

---

## Placeholder Behavior

The component renders a default option:

```vue
<option value="">
  {{ placeholder }}
</option>
```

A filter can therefore use:

```vue
placeholder="Todos"
```

with:

```text
value = ""
```

This convention makes resetting or disabling a filter straightforward.

For example:

```text
""         -> do not filter by transaction type
"income"   -> show only incomes
"expense"  -> show only expenses
```

---

## Optional Label

The component retains an optional:

```ts
label?: string;
```

prop because existing views already use the component with labels such as:

```text
Actividad
Cuenta
Tipo
Mes
Año
```

The label is rendered only when provided.

This keeps the component flexible while remaining compatible with the current FinZen filter UI.

---

## Transactions Integration

`TransactionsView.vue` reuses `SelectorFiltro` for:

```text
Actividad
Cuenta
Tipo
Mes
```

The acceptance criteria explicitly require reuse for:

```text
type
account
month
```

The existing Activity filter is preserved as an additional use of the same shared component.

---

## Account Filter

Account IDs in the domain model are numeric.

The component contract requires option values to be strings.

Therefore, account options are mapped as:

```ts
const accountOptions = computed(() =>
  myAccounts.value.map((account) => ({
    value: String(account.id),
    label: `${account.name} · ${account.type}`,
  })),
);
```

This converts:

```text
1
```

into:

```text
"1"
```

before passing the value to `SelectorFiltro`.

---

## Activity Filter

The same conversion is applied to activity IDs:

```ts
const activityOptions = computed(() =>
  myActivities.value.map((activity) => ({
    value: String(activity.id),
    label: activity.name,
  })),
);
```

This keeps all `SelectorFiltro` option values aligned with the component's string contract.

---

## Comparing String Filters with Numeric IDs

Because the component returns strings but transaction IDs remain numeric, comparison must normalize
the transaction-side value.

For example:

```ts
String(transaction.accountId) !== fAccount.value
```

instead of:

```ts
transaction.accountId !== fAccount.value
```

Without conversion:

```text
1 !== "1"
```

would evaluate to:

```text
true
```

even though both values represent the same account.

With conversion:

```text
String(1) === "1"
```

the values can be compared correctly.

---

## Transaction Type Filter

The transaction type options already use strings:

```ts
const typeOptions = [
  { value: 'income', label: 'Ingreso' },
  { value: 'expense', label: 'Gasto' },
];
```

Therefore no conversion is required.

The filter can directly compare:

```ts
transaction.type !== fType.value
```

---

## Month Filter

COMPONENT-26 requires Transactions to use `SelectorFiltro` for a month filter.

A new filter state was introduced:

```ts
const fMonth = ref('');
```

The month options use zero-padded strings:

```ts
const monthOptions = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];
```

The template uses:

```vue
<SelectorFiltro
  label="Mes"
  v-model="fMonth"
  :options="monthOptions"
  placeholder="Todos"
/>
```

---

## Month Filtering Logic

Transactions store their date using the format:

```text
YYYY-MM-DD
```

For example:

```text
2026-09-15
```

The month can be obtained with:

```ts
transaction.date.slice(5, 7)
```

which returns:

```text
09
```

The filter therefore applies:

```ts
if (
  fMonth.value &&
  transaction.date.slice(5, 7) !== fMonth.value
) {
  return false;
}
```

For example:

```text
Selected month:
09

Transaction:
2026-09-15
     ^^
     09
```

matches successfully.

A transaction from:

```text
2026-08-20
```

returns:

```text
08
```

and is excluded when the selected filter is:

```text
09
```

---

## Combined Filters

The existing `filtered` computed property applies each active filter sequentially.

Conceptually:

```text
All transactions
       |
       v
Activity filter
       |
       v
Account filter
       |
       v
Type filter
       |
       v
Month filter
       |
       v
From date
       |
       v
To date
       |
       v
Filtered transactions
```

This means filters can be combined.

For example:

```text
Cuenta = 1
Tipo = expense
Mes = 09
```

returns only transactions that satisfy all three conditions.

---

## Active Filter Counter

The month filter was also added to the existing active-filter counter.

The counter now considers:

```text
activity
account
type
month
from
to
```

For example:

```text
Mes = Septiembre
```

produces:

```text
1 activo
```

while:

```text
Mes = Septiembre
Tipo = Gasto
Cuenta = Principal
```

produces:

```text
3 activos
```

---

## Reset Behavior

The month state was also integrated into the existing filter reset behavior.

Resetting the filters restores every filter to:

```text
""
```

including:

```ts
fMonth.value = '';
```

This returns `SelectorFiltro` to its placeholder option and restores the full transaction list.

---

## Reports Integration

`ReportsView.vue` already used `SelectorFiltro` to select:

```text
Mes
Año
```

These controls represent the period filter required by the issue.

The component is used as:

```vue
<SelectorFiltro
  label="Mes"
  v-model="selMonth"
  :options="months"
  placeholder=""
/>

<SelectorFiltro
  label="Año"
  v-model="selYear"
  :options="years"
  placeholder=""
/>
```

The selected values are combined into:

```ts
const periodKey = computed(
  () => `${selYear.value}-${selMonth.value}`,
);
```

For example:

```text
Year = 2026
Month = 09
```

produces:

```text
2026-09
```

which can be used to select the corresponding reporting period.

---

## Reports Month Typing

After making `SelectorFiltro` strict, TypeScript detected an inconsistency in the old Reports month
definition.

The original tuple/map construction could infer:

```ts
string | undefined
```

for `label` and `value`.

However, `SelectorFiltro` correctly requires:

```ts
{
  label: string;
  value: string;
}
```

The Reports month options were therefore changed to an explicitly typed collection:

```ts
interface FilterOption {
  label: string;
  value: string;
}

const months: FilterOption[] = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];
```

This guarantees that every option satisfies the component contract.

---

## Separation of Responsibilities

`SelectorFiltro` does not know how a transaction or report should be filtered.

Its responsibility is only:

```text
Receive options
        |
        v
Display select
        |
        v
Receive modelValue
        |
        v
Emit selected string value
```

The views remain responsible for:

```text
TransactionsView
    -> Decide which transactions match the filters

ReportsView
    -> Decide which report period is selected
```

This keeps the reusable component generic.

---

## Acceptance Criteria Status

| Criterion | Status | Notes |
| --- | --- | --- |
| Reusable `SelectorFiltro.vue` exists | Complete | Existing shared component was reused and refactored. |
| Accepts `options: { label: string; value: string }[]` | Complete | Implemented through `FilterOption[]`. |
| Accepts `modelValue: string` | Complete | Strict string contract implemented. |
| Emits `update:modelValue` | Complete | Event is strictly typed and emitted on selection change. |
| Accepts `placeholder?: string` | Complete | Optional prop with default value. |
| Reused in Transactions for type | Complete | Existing type filter uses `SelectorFiltro`. |
| Reused in Transactions for account | Complete | Account IDs are converted to strings. |
| Reused in Transactions for month | Complete | Month selector and filtering logic were added. |
| Reused in Reports for period | Complete | Month and year selectors use the shared component. |
| Props strictly typed with TypeScript | Complete | `Props` and `FilterOption` interfaces are explicit. |

---

## Files Changed

The feature is intentionally limited to three source files:

```text
frontend/src/components/shared/SelectorFiltro.vue
frontend/src/views/TransactionsView.vue
frontend/src/views/ReportsView.vue
```

No service, store, router, or domain model changes were required for COMPONENT-26.

This keeps the change focused on the reusable filter component and its required integrations.

---

## Validation

The strict component contract was checked against its consumers.

The component itself no longer produces the loose typing problems present in the original
implementation.

The following behaviors were covered by the implementation:

### Selector value update

```text
Select option
      |
      v
onChange
      |
      v
update:modelValue
      |
      v
Parent ref changes
```

### Transactions account filter

```text
Account option string ID
      |
      v
Compare with String(transaction.accountId)
```

### Transactions month filter

```text
Selected "09"
      |
      v
Extract "09" from YYYY-09-DD
      |
      v
Matching transactions remain
```

### Reports period filter

```text
Month + Year
      |
      v
selMonth + selYear
      |
      v
periodKey
```

---

## Repository-Wide Type Check Finding

Running the complete project TypeScript check still reports a large number of errors in unrelated
legacy files.

Examples include:

```text
Cannot find module '@/store'
```

in multiple legacy views and strict-typing problems in components such as:

```text
GraficoChart.vue
TablaGenerica.vue
```

These errors already exist outside COMPONENT-26 and are associated with the ongoing migration away
from the removed legacy store architecture.

COMPONENT-26 should not expand into a refactor of:

```text
Accounts
Activities
Reports business logic
Transactions business logic
Users
Charts
Generic tables
```

solely to make the entire repository pass its existing legacy type errors.

The strict `SelectorFiltro` implementation did expose one consumer-side typing inconsistency in
`ReportsView.vue`; that issue was corrected because it directly affected the component contract.

---

## Known Out-of-Scope Technical Debt

`TransactionsView.vue` and `ReportsView.vue` still contain legacy imports from:

```text
@/store
```

Those dependencies are unrelated to the reusable select component itself.

They must be migrated through the appropriate service/view issues following the project architecture:

```text
View -> Service -> Store
```

COMPONENT-26 does not introduce or solve that broader migration.

---

## Remaining Follow-Up Before Merge

### 1. Review the final diff

Confirm that the pull request contains only the intended files:

```text
SelectorFiltro.vue
TransactionsView.vue
ReportsView.vue
```

---

### 2. Keep the component single-source

Do not add a second:

```text
src/components/SelectorFiltro.vue
```

while the application already uses:

```text
src/components/shared/SelectorFiltro.vue
```

unless the team explicitly decides to reorganize the component directory.

Only one implementation should exist.

---

### 3. Keep unrelated legacy fixes out of the issue

Repository-wide `@/store` migration and generic Chart/Table typing issues should remain in their
corresponding work items.

---

### 4. Run available quality checks

Before merge, run the repository's lint/format checks on the files changed by COMPONENT-26.

The full project type-check/build may continue to report known legacy errors until the corresponding
views are migrated.

Any new error specifically caused by one of the three COMPONENT-26 files should still be resolved
before merge.

---

## Result

COMPONENT-26 provides a single reusable select/filter component with the following data flow:

```text
Parent View
    |
    | modelValue
    v
SelectorFiltro
    |
    | user changes selection
    v
update:modelValue
    |
    v
Parent View state
    |
    v
computed filtering/report logic
```

The component can now be reused with a consistent API:

```vue
<SelectorFiltro
  v-model="selectedValue"
  :options="options"
  placeholder="Todos"
/>
```

Transactions reuses it for account, type, month, and activity filters.

Reports reuses it for month and year period selection.

The implementation therefore satisfies the functional requirements of COMPONENT-26 while
preserving strict TypeScript typing and avoiding duplicate filter components.