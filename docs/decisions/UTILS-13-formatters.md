# UTILS-13: Implement pure formatter utilities

## What was done

- Created `src/utils/formatters.ts` with three pure functions: `formatToCOP`, `formatDate`, `monthKey`.
- Updated `ReportService.getMonthlyTotals()` to reuse `monthKey()` instead of duplicating the same date-slicing logic inline.

## Decisions

### 1. `formatToCOP(amount)`
Uses `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`. `maximumFractionDigits: 0` was set because COP is not commonly displayed with cents in everyday use, keeping the output closer to how amounts are actually shown to Colombian users (e.g. `$ 15.000` instead of `$ 15.000,00`).

### 2. `formatDate(dateStr)` and the UTC timezone fix
Uses `Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })`. Initial implementation omitted `timeZone`, which caused an off-by-one day bug: `new Date('2026-01-05')` parses as UTC midnight, and formatting without a fixed `timeZone` renders it in the *local* timezone of whoever runs the code — in a negative UTC offset (e.g. Colombia, UTC-5) this rolled the date back to "4 de enero" instead of "5 de enero". Fixed by pinning `timeZone: 'UTC'`, making the output deterministic regardless of the caller's machine/browser timezone and consistent with how date-only ISO strings are actually stored.

### 3. `monthKey(dateStr)`
Implemented as `dateStr.slice(0, 7)`, matching the exact logic that `ReportService.getMonthlyTotals()` already used inline before this change. Extracting it into a shared pure utility avoids duplicating the same string-slicing rule in every place that needs to group data by month.

### 4. Purity
None of the three functions read from a Pinia store, import a Vue component, or produce side effects — they only transform their input arguments and return a value, per `docs/wiki/Coding-Style-Guide.md` ("Pure Utilities": `src/utils/` must be pure with no side effects and no Vue/Pinia dependencies).

## Validation

- `npm run type-check` passes cleanly.
- `npx eslint` reports no issues on `formatters.ts` / `ReportService.ts`.
- Verified output manually: `formatToCOP(15000)` → `"$ 15.000"`; `formatDate("2026-01-05")` → `"5 de enero de 2026"` (post-fix); `monthKey("2026-01-05T10:00:00.000Z")` → `"2026-01"`.
