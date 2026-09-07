# COMPONENT-92: Replace GenericTable with typed, view-specific table components

## What was done

- Deleted `src/components/shared/GenericTable.vue` and its exported
  `TableColumn` interface. No remaining references anywhere in `src/`.
- Added two domain-agnostic primitives to `src/components/shared/`:
  - `TableSkeleton.vue` — props `{ columns: number; rows?: number }` (default
    5), renders the shimmer-row fragment that used to be inlined in
    `GenericTable`. `columns` is the total column count including an actions
    column, if any.
  - `EmptyState.vue` — props `{ icon: Component; title: string; text?: string }`,
    renders the icon-box/title/text empty state that used to be inlined in
    `GenericTable`.
- Added one component folder per consuming view, each holding a concrete,
  fully-typed table (no `unknown`, no cast helpers):
  - `src/components/dashboard/RecentTransactionsTable.vue` —
    `{ rows: TransactionInterface[]; loading?: boolean }`, no emits.
  - `src/components/transactions/TransactionsTable.vue` —
    `{ rows: TransactionInterface[]; loading?: boolean }`, emits
    `edit`/`delete` with the full `TransactionInterface` row (the row carries
    what the confirm dialog and the edit route both need, so the caller
    doesn't have to re-fetch it).
  - `src/components/users/UsersTable.vue` —
    `{ users: UserInterface[]; loading?: boolean; currentUserId?: number | null }`,
    emits `changeRole`/`toggleActive` with the `UserInterface` row.
  - `src/components/reports/BudgetSummaryTable.vue` — `{ rows: SummaryRow[] }`,
    no emits, no loading (the original never had one here either). Exports
    `SummaryRow`, replacing the interface that used to live locally in
    `ReportsView.vue`.
- Rewired the four views to compose these components instead of `GenericTable`
  + slots: `DashboardView.vue` (263→192 lines), `TransactionsShowView.vue`
  (383→279), `UsersShowView.vue` (228→106), `ReportsView.vue` (374→313). Each
  view keeps its own filters/computed state/business logic — only the
  `<table>` markup, cell slots, and their cast helpers (`asTx`, `asUser`,
  `asTransaction`, `asSummaryRow`) moved out.
- Moved every CSS rule that styled the removed slot markup into its new
  component: `.tx-desc`, `.dot`, `.tx-name`, `.tx-acc`, `.amt-in`/`.amt-out`
  (Dashboard + Transactions, each keeping its own slightly different rules —
  see Decisions), `.u`, `.u-avatar`, `.u-avatar.admin`, `.u-name`,
  `.btn[disabled]`, `.user-actions`, `.row-actions`, `.rn`, `.pos`, `.neg`.
- Dropped two CSS rules that had no matching markup anywhere:
  `.u-mail`, `.status-dot`/`.status-dot.on` (dead CSS from a previous
  `UsersShowView` iteration).

## Decisions

### The new table components do their own service lookups (not pre-joined rows)
`TransactionsTable`/`RecentTransactionsTable` import `ActivityService`/
`AccountService` directly and call `getById()` per row to resolve activity
name/color and account name — the same lookups the views used to do inline in
their slots. This is a deliberate, temporary trade-off: the "clean" version
(the service returns rows already joined with `activityName`/`accountName`)
depends on work not done yet (moving that join into `TransactionService`,
tracked separately). Doing that now would have coupled this component
extraction to an unrelated service refactor. These components living outside
`components/shared/` makes importing a service legal per the architecture
guide (`components/shared/` may not know about domain entities;
`components/<view>/` can). When the service-side join lands, only these two
components' data source changes — their template and CSS don't.

### Two nearly-identical CSS blocks were kept separate, not merged
`RecentTransactionsTable.vue` and `TransactionsTable.vue` both define
`.tx-desc`, `.dot`, `.tx-name`, `.amt-in`, `.amt-out` — but not identically:
Dashboard's `.amt-out` sets `color: var(--text)`, Transactions' doesn't;
Dashboard's `.tx-desc` wraps a nested `<div>` (name + account line),
Transactions' doesn't (no account line in that slot); Dashboard's `.dot` sits
in a `.tx-desc` with `gap: 10px`, matching what was already different between
the two source views. Unifying them would have changed one or the other's
rendered output — exactly what the project's fidelity-to-prototype rule
forbids. Same reasoning applies to `.dot`/`.rn` in `BudgetSummaryTable.vue`,
which never had `flex-shrink: 0` unlike the other two `.dot` rules — kept as-is.

### `EmptyState` ships without a `variant` prop
The original design considered a `card` variant for `AccountsShowView`/
`ActivitiesShowView`'s own empty states, but neither view is touched by this
issue. Shipping an unused variant would be speculative code with no call
site — the same "no dead code" standard applied to `TransactionService`'s
unused filters in `SERVICE-88`. A `card` variant can be added, with its own
padding/icon-size values, whenever those two views get their own refactor.

### `row-actions` inner wrapper `<div>` kept even where the surrounding `v-if` is gone
`GenericTable`'s `actions` slot always wrapped its buttons in `.row-actions`
and, in the two source views, an inner `<div>` — the `<div>` had `v-if="row"`
in the original (defensive against a slot value that could never actually be
falsy). `TransactionsTable`/`UsersTable` drop the now-pointless `v-if` but
keep the `<div>` element itself, because `.row-actions { gap: 6px }` applies
to its direct children — removing the wrapper would turn the buttons into
flex-gap siblings directly, which happens to look identical here but was
flagged as a fidelity risk during planning; keeping the element removes any
doubt at zero cost.

## Validation

- `npm run type-check`: no errors.
- `npm run build`: succeeds, no new warnings.
- `npm run lint`: 11 pre-existing errors, identical count/lines to `main`;
  none related to this change.
- Manual pass through `/`, `/transactions`, `/users`, `/reports` (loading
  skeleton, populated, and empty-filter states, light and dark theme):
  no visual difference from `main`.
