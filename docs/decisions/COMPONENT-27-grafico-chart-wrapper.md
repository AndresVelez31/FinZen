# COMPONENT-27: Create GraficoChart reusable Chart.js wrapper

## Summary

Refactored `GraficoChart.vue` into a pure, presentational Chart.js wrapper completely decoupled from domain logic and legacy store instances (`@/store`).

## Key Implementations

- **Props Interface**: Added full TypeScript support for chart configurations:
  - `type`: Supports `'bar' | 'line' | 'doughnut' | 'pie'` (or any valid `ChartType`).
  - `labels`: Accepts `string[]` for axis/legend labels.
  - `datasets`: Accepts `ChartDataset[]` objects.
  - `title`: Optional `string` prop for chart title rendering.
  - `options` & `height`: Props for customizable layout and Chart.js options.
- **Memory Leak Prevention**: Guaranteed clean lifecycle teardown in `onUnmounted` by calling `chartInstance.destroy()` and disconnecting observers.
- **Theme Reactivity**: Integrated a native `MutationObserver` on `document.documentElement` to adapt colors dynamically when dark mode changes, avoiding state store coupling.
- **Data Reactivity**: Utilized `watch` with `{ deep: true }` and `nextTick` to re-render charts smoothly when labels, datasets, or type props change.

## Decisions

### Why `MutationObserver` over global store state?
`GraficoChart` must remain a domain-agnostic UI wrapper. Observing class attribute mutations on `document.documentElement` allows the component to react to dark/light mode switches natively without importing global stores or service dependencies.

## Verification

- Type checking validated via `npx vue-tsc --noEmit -p tsconfig.app.json`.
- Code formatted using `npm run format`.
- Visual validation completed for chart re-rendering and theme toggle.