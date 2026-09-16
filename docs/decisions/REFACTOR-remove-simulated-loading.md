# REFACTOR: Remove the simulated loading state

## Status

Accepted — intentional deviation from the original prototype (`06be02e`)
and a clarification of `Programming-Rules.md` §3.5.

## Context

`OverviewView`, `TransactionsShowView`, `UsersShowView` and
`ActivitiesShowView` each started with `const loading = ref(true)` and
flipped it with `onMounted(() => setTimeout(() => (loading.value = false), 450))`
(500 ms on Overview). While `loading` was `true`, the three table components
rendered `TableSkeletonComponent` rows and `ActivitiesShowView` rendered
three `skeleton-card` placeholders.

Deliverable 1 has no backend: every Service reads synchronously from Pinia
(persisted in `localStorage`), so the data is already there on the first
render. The delay existed only to make the skeleton visible — it was
inherited from the original prototype, where the same `setTimeout` pattern
was used for the same reason. In practice it just delayed every page by
roughly half a second.

## Decision

Removed the simulated loading state entirely:

- The four views no longer declare `loading`, no longer import `onMounted`
  (and `ref` where it was only used for `loading`), and no longer pass
  `:loading` to their tables.
- `RecentTransactionsTableComponent`, `TransactionsTableComponent` and
  `UsersTableComponent` lost their `loading` prop; each now renders rows when
  there are some and `EmptyState` otherwise.
- `TableSkeletonComponent.vue` was deleted (it had no other callers).
- `ActivitiesShowView` lost its skeleton-card grid and the related CSS.

The `onMounted`/`onUnmounted` hooks in `ChartGraphicComponent` and
`RadialProgressComponent` stay: they need the rendered canvas and
subscribe/unsubscribe to theme changes.

`Programming-Rules.md` §3.5 and the `CONTRIBUTING.md` author checklist now
state that a loading state applies only to real asynchronous data and must
not be simulated. The success, empty and error states are unchanged.

## Consequences

- Pages render their data immediately.
- This is a visible deviation from the original prototype (no shimmer on
  first paint), accepted explicitly by the team.
- If a backend is introduced later, a loading state should be added back
  around the real asynchronous call, not with a timer.
