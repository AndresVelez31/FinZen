# TRANSACTIONS-18: Implement TransactionsIndexView with multi-filter and actions

## What was done

- Refactored `TransactionsView.vue` to drop legacy `@/store` dependencies and migrate to static services (`TransactionService`, `AccountService`, and `ActivityService`).
- Implemented multi-filtering with `SelectorFiltro` for activity, account, type, and date range (`fFrom` / `fTo`).
- Integrated monetary formatting using `formatToCOP` and date formatting using `formatDate` from `@/utils/formatters`.
- Computed dynamic totals (`income` and `expense`) and bar chart datasets from filtered transactions.
- Added action handlers to navigate to transaction creation/editing and to delete records using `SweetAlert2` confirmation.

## Decisions

### Why handle account and activity name lookups via service helper functions?
Transactions store foreign key IDs (`accountId`, `activityId`). Helper functions (`getActivity`, `getAccount`) backed by `ActivityService` and `AccountService` isolate row-level slot rendering from relational store implementations while handling fallback cases cleanly.

### Why enforce explicit TypeScript typings on array operations and selector options?
Declaring explicit callback parameter types (e.g. `(t: TransactionInterface) => ...`) and explicit option types (`{ value: string; label: string }[]`) prevents `noImplicitAny` compilation errors under strict `vue-tsc` checks when binding data to `SelectorFiltro` and `TablaGenerica`.

### Why pass datasets to `GraficoChart` declaratively without editing the chart component?
In accordance with strict issue boundary rules, `GraficoChart.vue` was kept untouched as it belongs to Issue #27 (`[COMPONENT-27]`). `TransactionsView.vue` passes computed dataset structures to `GraficoChart` declaratively without introducing scope creep.

## Validation

- Type-checked via `npx vue-tsc --noEmit -p tsconfig.app.json`.
- Formatted via `npm run format`.