# CHORE-105: Comment banners and script section order across the 10 views

## Status

Accepted

## Context

Point 7/9 of the professor's feedback (the last item from the original
9-point refactor plan): organize `<script setup>` in the 10 views under
`frontend/src/views/` with consistent comment banners, remove redundant
comments, and confirm no business logic remains in views — the last is
already true after `REFACTOR-94`/`SECURITY-account-ownership...`, this PR
is a final sweep, not a rewrite of logic.

Before this PR the views had no consistent convention: some had zero
banners (`UsersShowView.vue`, `AccountsShowView.vue`), one still had the
old `/* ---- Section ---- */` block-comment style (`ReportsView.vue`), and
none grouped `<script setup>` into named sections.

A stale memory (`finzen-view-script-conventions.md`) claimed a different,
more invasive convention had already been hand-applied to the 10 views
(`// --- Vue core ---` banners, Spanish section comments, renamed
variables like `fRole` → `filterRole`). Auditing the actual code showed
none of that was present — the memory didn't match reality. Presented with
the contradiction, the user confirmed following this plan's convention
instead; the memory has been corrected.

## Decision

**Banners**: `// Name` at column 0, no dashes, no `/* */`. Only added when
a section has content: `Imports`, `Types` (local interfaces only),
`State` (route/router, refs, plain constants), `Computed` (anything
wrapped in `computed()`), `Actions` (validate/submit/handlers),
`Lifecycle` (`onMounted`, moved to the end of the script in every view
that had it — safe, since it only registers a deferred callback and never
runs synchronously during setup).

**Comments in English**; Spanish stays only in user-visible strings.

**No variable renames.** This PR is comments and block order only —
zero behavior change, per the plan's own constraint.

**Local `interface` declarations** (`FormErrors` in the three form views,
`DemoAccount` in `LoginView`) moved to right after `Imports`, under a
`Types` banner — safe unconditionally, since TS interfaces are erased at
compile time and have no runtime position dependency.

**Two `State` banners in the three form views** (`AccountFormView`,
`ActivityFormView`, `TransactionFormView`): `accounts`/`activities` (or
the account-specific static list) are read synchronously inside
`createInitialFormState()`, which itself runs synchronously as part of
`const form = ref(createInitialFormState())`. That means the `Computed`
block declaring those lists must textually precede the `form` ref
initialization — the reverse order would throw a temporal-dead-zone error.
Rather than force a risky reorder to get one contiguous `State` block, the
`Computed` banner sits in the middle and a second `State` banner picks
back up after it. This is called out explicitly rather than silently
accepted as a stylistic wart.

**`resetFilters` and the filter `typeOptions` constant** in
`TransactionsShowView` were moved into their natural `Actions`/`State`
buckets — verified safe: `resetFilters` is a hoisted `function` never
called synchronously during setup, and `typeOptions` is a plain array no
computed depends on.

**Comment deletions** (per the plan's criteria: restates the identifier,
explains a language rule rather than a domain rule, or labels a
self-descriptive template element immediately below it):
- `ReportsView.vue`: removed `/* ---- Summary table ---- */` (pure
  restatement of what `summaryRows`/`BudgetSummaryTable` obviously is).
  Converted the other three block comments to single-line `//` and kept
  them — they state genuine domain scope (which period a chart covers,
  and that savings progress is all-time vs. the budget figures being
  period-scoped), which isn't obvious from the identifier alone.
- `AccountFormView.vue`: removed `<!-- Nombre -->`, `<!-- Tipo -->`,
  `<!-- Saldo -->`, `<!-- Botones -->` — each sits directly above a
  self-descriptive `<label>` or actions block, exactly the case the plan
  calls out as deletable.
- `TransactionFormView.vue`: removed `<!-- Type toggle -->` and
  `<!-- Amount -->` for the same reason.

**Comments kept as-is** (explain domain/architecture *why*, not what):
the "Reruns whenever the route's :id changes..." comment above each form's
`watch(...)` call (all three form views — explains a real Vue Router
component-reuse gotcha), and the inline chart-purpose comments in
`DashboardView`/`TransactionsShowView`/`ReportsView`.

## Consequences

- All 10 views now follow the same section order and banner format,
  closing the last open item from the professor's 9-point list.
- `npm run type-check`, `npm run build`, and `npm run lint:eslint` all
  pass with the same pre-existing 8-error ESLint baseline
  (`no-undef`/`no-explicit-any` config gaps, unrelated to this change) —
  confirming zero behavior change, as intended.
- The two-`State`-banner pattern in the form views is a known, documented
  trade-off, not an oversight — reordering further would require either
  restructuring `createInitialFormState()` to lazily read `accounts.value`
  (a real behavior-adjacent change) or accepting the split banner. Kept
  the split banner as the lower-risk option.
