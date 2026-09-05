# UTILS-81: Move ReportService out of services into utils

## What was done

- Moved `ReportService.ts` from `src/services/` to `src/utils/` via `git mv`.
- Updated the import path in both consumers, `ReportsView.vue` and
  `ActivitiesShowView.vue` (found by grepping the whole `src/` tree for
  `ReportService`), from `@/services/ReportService.js` to
  `@/utils/ReportService.js`.

## Decisions

### Why `ReportService` doesn't belong in `services/`
The project's `services/` layer is one-to-one with the entities in the domain diagram
(`UserService`, `AccountService`, `ActivityService`, `TransactionService`).
`ReportService` doesn't own or mutate any entity's store — it only reads from
`AccountService`/`ActivityService`/the transaction store and aggregates their data for
display (totals by activity, totals by month, period summaries). That's a
presentation-layer concern reused across views, which is exactly what `utils/` is for.

### No internal changes needed
`ReportService.ts` already imported its one `utils/` dependency (`monthKey`, from
`formatters.js`) via the `@/utils/...` alias, and its dependencies on
`AccountService`/`ActivityService` are unaffected by where `ReportService` itself
lives. So the move required zero changes to the file's own content — only the two
import paths in its consumers.

## Validation

- `npm run type-check`: no errors.
- `npm run lint`: no new errors; only pre-existing ones in unrelated files.
- Confirmed via `grep -rl "ReportService" frontend/src` that only `ReportsView.vue` and
  `ActivitiesShowView.vue` import it, and both were updated.