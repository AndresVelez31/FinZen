# COMPONENT-25: Implement GenericTable Reusable Component

## Status

Implemented, pending final integration validation.

The reusable table component was standardized as:

```text
GenericTable.vue
```

The component now provides:

- Dynamic columns.
- Dynamic rows.
- Strictly typed TypeScript props.
- Optional loading state.
- Empty state.
- Custom cell slots.
- Optional actions slot.
- Horizontal scrolling for smaller screens.
- No domain-specific business logic.

The component is already used by administrative and transaction-related views.

Before closing COMPONENT-25, the remaining integration requirement is to verify that the Activities
view also uses `GenericTable.vue` instead of maintaining a duplicated table implementation.

---

## Context

The project originally contained a reusable table component named:

```text
TablaGenerica.vue
```

The component already provided useful functionality such as:

```text
Dynamic headers
Dynamic rows
Loading skeleton
Empty state
Custom cell slots
Actions slot
```

However, its props were originally defined using generic runtime arrays:

```ts
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
});
```

This meant TypeScript did not know the actual structure of:

```text
columns
rows
```

and could infer values such as:

```text
unknown
```

when the component was consumed by strict TypeScript views.

COMPONENT-25 formalizes the table as a reusable, strictly typed component that can be used by
multiple parts of FinZen without containing logic for any specific domain entity.

---

## Naming Decision

The component was renamed from:

```text
TablaGenerica.vue
```

to:

```text
GenericTable.vue
```

The reason is that the FinZen source code follows English naming conventions.

Examples include:

```text
AccountService
UserService
TransactionService
AccountInterface
DashboardView
StatCard
GenericTable
```

The source-code name therefore remains consistent with the rest of the project.

Visible application text can continue to use Spanish.

For example:

```text
Acciones
Sin resultados
Sin usuarios
No hay datos para mostrar por ahora
```

are user-interface strings and do not conflict with English source-code naming.

---

## Component Responsibility

`GenericTable.vue` is responsible only for presenting tabular data.

Conceptually:

```text
View
  |
  | columns
  | rows
  | slots
  v
GenericTable
  |
  v
Rendered table
```

The component does not know whether the rows represent:

```text
Users
Transactions
Activities
Accounts
Reports
```

This is what makes it generic.

---

## What Was Done

- Renamed the reusable table component to `GenericTable.vue`.
- Added a `TableColumn` TypeScript interface.
- Added a `TableRow` TypeScript interface.
- Added a typed `Props` interface.
- Typed `columns`.
- Typed `rows`.
- Preserved optional `loading`.
- Preserved optional `hasActions`.
- Preserved customizable empty-state text.
- Preserved dynamic table headers.
- Preserved dynamic table rows.
- Preserved custom cell slots.
- Preserved the `actions` slot.
- Preserved the loading skeleton.
- Preserved the empty state.
- Preserved responsive horizontal scrolling.
- Kept all domain-specific formatting in the consuming Views.
- Updated consumers from `TablaGenerica` to `GenericTable` where required.

---

## TableColumn

Columns are now described by:

```ts
interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}
```

Each column therefore requires:

```text
key
label
```

and may optionally define:

```text
align
width
```

For example:

```ts
const columns = [
  {
    key: 'name',
    label: 'Nombre',
  },
  {
    key: 'email',
    label: 'Correo',
  },
  {
    key: 'amount',
    label: 'Valor',
    align: 'right',
  },
];
```

---

## Column Key

The `key` determines which property should be read from each row.

For example:

```ts
{
  key: 'email',
  label: 'Correo',
}
```

causes the component to read:

```ts
row['email']
```

from every row.

Conceptually:

```text
Column key = email
       |
       v
row.email
       |
       v
Rendered cell
```

---

## Column Label

The `label` is the text displayed in the table header.

For example:

```ts
{
  key: 'createdAt',
  label: 'Registro',
}
```

produces a header such as:

```text
REGISTRO
```

The component does not need to understand the meaning of the column.

---

## Optional Alignment

A column may define:

```ts
align?: 'left' | 'center' | 'right';
```

For example:

```ts
{
  key: 'amount',
  label: 'Valor',
  align: 'right',
}
```

This allows numerical values to be aligned differently without introducing financial logic into
the generic component.

---

## Optional Width

A column can also provide:

```ts
width?: string;
```

This allows consuming Views to influence column presentation when necessary.

If no width is provided, the component uses:

```text
auto
```

---

## TableRow

Rows are described by:

```ts
interface TableRow {
  id?: number | string;
  [key: string]: unknown;
}
```

The optional `id` can be used as the Vue `key`.

The index signature:

```ts
[key: string]: unknown;
```

allows the table to receive different entity shapes.

For example, all of the following can conceptually be rows:

```ts
{
  id: 1,
  name: 'Admin Demo',
  email: 'admin@finzen.app',
}
```

```ts
{
  id: 15,
  description: 'Mercado',
  amount: 250000,
  type: 'expense',
}
```

```ts
{
  id: 3,
  name: 'Entretenimiento',
}
```

The table itself does not need separate implementations for each entity.

---

## Props

The component uses:

```ts
interface Props {
  columns: TableColumn[];
  rows?: TableRow[];
  loading?: boolean;
  hasActions?: boolean;
  emptyTitle?: string;
  emptyText?: string;
}
```

Default values are provided through:

```ts
withDefaults(defineProps<Props>(), {
  rows: () => [],
  loading: false,
  hasActions: false,
  emptyTitle: 'Sin resultados',
  emptyText: 'No hay datos para mostrar por ahora.',
});
```

This gives the component a predictable API.

---

## Dynamic Headers

Headers are generated using:

```vue
<th
  v-for="col in columns"
  :key="col.key"
>
  {{ col.label }}
</th>
```

Therefore, the component does not hard-code headers such as:

```text
Nombre
Correo
Fecha
Valor
Rol
```

The consuming View decides which columns exist.

---

## Dynamic Rows

Rows are generated using:

```vue
<tr
  v-for="(row, i) in rows"
  :key="row.id || i"
>
```

The table can therefore render any number of rows supplied by the View.

Conceptually:

```text
rows[]
  |
  v
v-for
  |
  v
<tr>
```

---

## Dynamic Cells

Cells are generated from the configured columns:

```vue
<td
  v-for="col in columns"
  :key="col.key"
>
```

The default value displayed is:

```ts
row[col.key]
```

This means a View can create a simple table without implementing individual templates for every
cell.

---

## Custom Cell Slots

`GenericTable` supports custom cells through named slots.

The slot name follows:

```text
cell-{columnKey}
```

For example:

```text
cell-role
cell-active
cell-date
cell-amount
```

The component provides:

```text
row
value
```

to the slot.

Conceptually:

```text
GenericTable
     |
     | row + value
     v
View custom slot
     |
     v
Custom cell presentation
```

---

## Default Cell Behavior

If a View does not provide a custom slot, the component falls back to:

```vue
{{ row[col.key] }}
```

This keeps basic tables simple.

For example, an email column does not need a special slot if the raw email text can be shown
directly.

---

## Example: Users

A Users view can define:

```ts
const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'role', label: 'Rol' },
  { key: 'active', label: 'Estado' },
];
```

Simple values such as email can use the default rendering.

Role can use:

```vue
<template #cell-role="{ value }">
  ...
</template>
```

Active state can use:

```vue
<template #cell-active="{ value }">
  ...
</template>
```

This keeps user-specific presentation outside `GenericTable`.

---

## Example: Transactions

Transactions can use the same component with completely different columns:

```ts
const columns = [
  { key: 'description', label: 'Descripción' },
  { key: 'date', label: 'Fecha' },
  { key: 'type', label: 'Tipo' },
  { key: 'amount', label: 'Valor', align: 'right' },
];
```

Then the View may customize:

```text
date
type
amount
```

through slots.

The table itself does not need transaction logic.

---

## Actions Slot

The component supports an optional actions column.

When:

```ts
hasActions = true
```

an additional header is displayed:

```text
Acciones
```

Each row then renders:

```vue
<slot
  name="actions"
  :row="row"
/>
```

This allows a consuming View to provide actions such as:

```text
Edit
Delete
Activate
Deactivate
Change role
```

without the generic table knowing what those actions mean.

---

## Example: User Actions

`UsersIndexView.vue` can provide:

```vue
<template #actions="{ row }">
  <button>
    Cambiar rol
  </button>

  <button>
    Desactivar
  </button>
</template>
```

Those buttons remain part of the Users domain.

`GenericTable.vue` only provides the row to the slot.

---

## Separation of Responsibilities

The table follows:

```text
GenericTable
├── rendering
├── dynamic columns
├── dynamic rows
├── slots
├── loading state
└── empty state
```

It does not contain:

```text
UserService
AccountService
TransactionService
ActivityService
Pinia Stores
Role rules
Financial rules
Transaction type rules
Account calculations
```

Those responsibilities belong to Views and Services.

---

## No Domain Logic

Code such as:

```ts
if (row.role === 'admin')
```

should not be placed inside `GenericTable`.

Likewise:

```ts
if (row.type === 'expense')
```

does not belong in the component.

Instead:

```text
GenericTable
     |
     v
slot
     |
     v
UsersIndexView / TransactionsView
```

handles the domain-specific presentation.

---

## Loading State

The component supports:

```ts
loading?: boolean;
```

When:

```text
loading = true
```

the component displays skeleton rows.

This capability remains reusable even if some current Views retrieve data synchronously from
Pinia.

For example:

```text
Current implementation
Service -> Pinia -> immediate result
```

may not require loading.

A future implementation could use:

```text
Service -> API -> asynchronous result
```

and reuse the same table loading state.

---

## Loading Skeleton

When loading is active, the component displays several skeleton rows instead of data.

Conceptually:

```text
loading = true
      |
      v
Skeleton rows
```

Once:

```text
loading = false
```

the component renders either:

```text
Data rows
```

or:

```text
Empty state
```

---

## Empty State

When:

```text
loading = false
```

and:

```text
rows.length === 0
```

the component displays:

```text
emptyTitle
emptyText
```

The defaults are:

```text
Sin resultados
No hay datos para mostrar por ahora.
```

Views may override these.

For example:

```vue
<GenericTable
  emptyTitle="Sin usuarios"
  emptyText="No hay usuarios que coincidan con el filtro."
/>
```

---

## Responsive Behavior

The component wrapper uses:

```css
.table-wrap {
  overflow-x: auto;
}
```

This allows the table to scroll horizontally when the viewport is too narrow.

Conceptually:

```text
Desktop
-------------------------------------------------
| Name | Email | Role | Status | Date | Actions |
-------------------------------------------------

Mobile
----------------------
| table content ...  | -> horizontal scroll
----------------------
```

This avoids forcing every consuming View to implement separate responsive table behavior.

---

## GenericTable and TypeScript

The previous generic `Array` props did not tell TypeScript what elements contained.

The new contract explicitly defines:

```text
TableColumn[]
TableRow[]
```

This improves:

```text
Autocomplete
Static validation
Strict-mode compatibility
Readable component contract
```

and reduces `unknown` errors caused by completely untyped arrays.

---

## Handling Domain-Specific Row Types

Because `GenericTable` must support multiple entities, its rows remain generic.

A consuming View may know that a row represents a specific interface.

For example:

```ts
function asUser(row: unknown): UserInterface {
  return row as UserInterface;
}
```

This conversion belongs in the Users View.

The generic table should not import `UserInterface`, because that would couple the component to one
domain.

The same principle can be used for:

```text
TransactionInterface
ActivityInterface
AccountInterface
```

if required by strict TypeScript checks.

---

## Reusability

The intended reuse is:

```text
                 GenericTable
                      |
        +-------------+-------------+
        |             |             |
        v             v             v
Transactions      Activities      Users
```

Additional views may also reuse it, such as:

```text
Dashboard
Accounts
Reports
```

when appropriate.

---

## Users Integration

The administrative users view uses:

```ts
import GenericTable from '@/components/shared/GenericTable.vue';
```

and provides:

```text
columns
rows
actions
custom cells
```

The component is therefore reused without containing administrative business logic.

Status:

```text
Complete
```

---

## Transactions Integration

Transactions should use:

```ts
import GenericTable from '@/components/shared/GenericTable.vue';
```

instead of the old:

```text
TablaGenerica.vue
```

Existing transaction slots and columns can remain unchanged.

Only the shared component reference needs to use the new English source-code name.

Status:

```text
Complete if the old import has already been replaced.
```

---

## Activities Integration

COMPONENT-25 also requires the Activities view to reuse the generic table.

The final branch must verify that Activities uses:

```text
GenericTable.vue
```

rather than maintaining a separate duplicated `<table>` structure.

Status:

```text
Pending final integration verification.
```

No additional Activity business logic should be moved into `GenericTable`.

---

## Acceptance Criteria Status

| Criterion | Status | Notes |
| --- | --- | --- |
| Generic reusable table component exists | Complete | Implemented as `GenericTable.vue`. |
| Dynamic columns | Complete | Headers come from `columns`. |
| Dynamic rows | Complete | Rows come from `rows`. |
| Props typed with TypeScript | Complete | `TableColumn`, `TableRow`, and `Props` are defined. |
| Custom cell rendering | Complete | Dynamic named slots are supported. |
| `#actions` slot | Complete | Optional actions column supported. |
| Empty state | Complete | Customizable empty title/text supported. |
| Loading state | Complete | Skeleton state preserved. |
| No domain-specific logic | Complete | Component only handles presentation. |
| Responsive behavior | Complete | Horizontal overflow is supported. |
| Reused in Users | Complete | `UsersIndexView.vue` uses `GenericTable`. |
| Reused in Transactions | Complete / verify final branch | Old component name must not remain. |
| Reused in Activities | Pending verification | Must be checked before closing the issue. |

---

## Manual Validation

### Basic Table

Input:

```ts
columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
];

rows = [
  {
    id: 1,
    name: 'Admin Demo',
    email: 'admin@finzen.app',
  },
];
```

Expected:

```text
NOMBRE       CORREO
Admin Demo   admin@finzen.app
```

Result:

```text
Passed through existing user-table usage.
```

---

### Custom Cell

Provide:

```text
cell-role
```

Expected:

```text
Default role text is replaced by custom badge presentation.
```

Result:

```text
Passed through Users integration.
```

---

### Actions

Set:

```ts
hasActions = true
```

and provide:

```text
#actions
```

Expected:

```text
Actions column appears.
Row-specific buttons are rendered.
```

Result:

```text
Passed through ADMIN-23.
```

---

### Empty State

Input:

```text
rows = []
loading = false
```

Expected:

```text
emptyTitle
emptyText
```

are displayed.

Result:

```text
Implemented; verify manually before merge if required.
```

---

### Loading State

Input:

```text
loading = true
```

Expected:

```text
Skeleton rows are displayed instead of table data.
```

Result:

```text
Implemented.
```

---

### Responsive Behavior

Reduce browser width.

Expected:

```text
Table remains usable through horizontal scrolling.
```

Result:

```text
Implemented through overflow-x: auto.
```

---

## Source-Code Language

The component source-code name was standardized in English:

```text
GenericTable.vue
```

Its code also uses English identifiers:

```text
TableColumn
TableRow
Props
columns
rows
loading
hasActions
emptyTitle
emptyText
row-actions
```

Visible Spanish UI strings are intentionally preserved because FinZen's interface is presented in
Spanish.

This separates:

```text
Source code language -> English
User-facing language -> Spanish
```

---

## Files Involved

Primary component:

```text
frontend/src/components/shared/GenericTable.vue
```

Expected consumer files include:

```text
frontend/src/views/UsersIndexView.vue
frontend/src/views/TransactionsView.vue
frontend/src/views/ActivitiesView.vue
```

or the equivalent current Activities view name.

Other consumers may also include:

```text
frontend/src/views/DashboardView.vue
```

depending on the merged branch state.

---

## Concepts Used

The implementation intentionally relies on Vue and TypeScript concepts already used in the project
and course tutorials:

```text
<script setup lang="ts">
Interfaces
Props
withDefaults
v-if
v-for
Slots
Dynamic slot names
Optional props
CSS responsive behavior
```

No Service, Store, DTO, or domain-specific dependency was added to the generic component.

---

## Remaining Follow-Up Before Merge

### 1. Verify Transactions Import

Search the project for:

```text
TablaGenerica
```

Expected result:

```text
0 references
```

Transactions should import:

```ts
import GenericTable from '@/components/shared/GenericTable.vue';
```

---

### 2. Verify Activities Integration

Inspect the Activities view.

Confirm that its listing uses:

```text
GenericTable
```

If it currently contains a manually duplicated `<table>`, migrate only the rendering structure.

Do not move Activity business logic into the shared component.

---

### 3. Search for Old Component Name

Run a project-wide search for:

```text
TablaGenerica
```

No stale imports or template tags should remain after the rename.

---

### 4. Run Quality Checks

Run:

```bash
npm run lint
npm run type-check
npm run build
```

Resolve any errors introduced by the `GenericTable` contract.

If unrelated legacy errors remain, document them separately instead of expanding COMPONENT-25 into
unrelated refactoring.

---

### 5. Review Final Diff

Run:

```bash
git status
```

and:

```bash
git diff
```

The branch should remain focused on:

```text
GenericTable typing
Component rename references
Required Transactions integration
Required Activities integration
Required Users integration
```

---

## Result

COMPONENT-25 provides a single reusable table component:

```text
GenericTable
```

that accepts:

```text
columns
rows
loading
hasActions
emptyTitle
emptyText
```

and exposes:

```text
custom cell slots
actions slot
```

The resulting architecture is:

```text
UsersIndexView -----------+
                         |
TransactionsView --------+----> GenericTable
                         |
ActivitiesView ----------+
```

Each View remains responsible for its own domain-specific behavior.

`GenericTable` remains responsible only for presenting reusable tabular UI.

The core component implementation is complete.

The issue can be fully closed once the required Transactions and Activities integrations are
verified in the final branch.