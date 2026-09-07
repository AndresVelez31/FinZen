# FEAT: Add ApexCharts as the second visual JS library

## Why

The deliverable requires two JavaScript libraries for visual/graphical elements — Chart.js is
mandatory, and the team picks a second one, with the enunciate giving leaflet/datatables/d3/three
as examples. Before this change, the project only used Chart.js for data visualization; Lucide Vue
Next (icons) and SweetAlert2 (alert dialogs) don't match the spirit of those examples, which are
all data/graphics visualization libraries, not icon sets or dialog boxes.

## What was done

Added **ApexCharts** (`apexcharts` + `vue3-apexcharts`) and used it where it offers something
Chart.js doesn't have out of the box: a radial-bar / gauge chart. The savings-goal progress cards
in `ReportsView.vue`, previously a hand-rolled CSS progress bar, now render as an ApexCharts
radial bar per savings activity.

A new reusable component, `RadialProgress.vue` (`frontend/src/components/shared/`), wraps
`vue3-apexcharts`'s `<VueApexCharts>` the same way `ChartGraphic.vue` wraps Chart.js:

- Props: `value` (0-100), `label`, `color`, `height`.
- No domain knowledge — the parent View computes the percentage and passes it in.
- Reacts to the app's dark-mode toggle via the same `MutationObserver` pattern `ChartGraphic.vue`
  already uses (watching `<html class="dark">`), so the track color and label color update without
  a page reload.

`ReportsView.vue`'s savings section was updated to use `<RadialProgress>` instead of the `.bar`
CSS element; the now-unused `.bar`/`.bar span`/`.saving-pct` styles were removed and `.saving`'s
layout adjusted to stack the radial chart above the goal name/amount.

## Decisions

- **ApexCharts over D3.js**: D3 is lower-level (manual SVG/scales/axes) and would risk producing
  code that reads like a copied tutorial, which the deliverable explicitly warns against. ApexCharts
  has an official Vue 3 + TypeScript wrapper, a declarative API consistent with how `ChartGraphic.vue`
  already wraps Chart.js, and a genuine functional reason to exist here (a chart type Chart.js lacks)
  rather than being added just to tick a box.
- **`eslint.config.ts`**: added `MutationObserver: 'readonly'` to the shared globals. The project's
  ESLint config declares browser globals ad hoc (`document`, `getComputedStyle`, `setTimeout` were
  already there) rather than using a full browser environment preset; `RadialProgress.vue` needed
  the same global `ChartGraphic.vue` already relies on (which was flagged by ESLint as a pre-existing,
  unrelated gap before this change — not introduced by it).

## Validation

- `npm run type-check` (`vue-tsc --build`): 0 errors project-wide.
- `npx eslint` on touched files: clean.
- Verified with a headless browser: `/reports` renders 2 ApexCharts radial-bar charts with real
  seeded savings-activity data (`Fondo de emergencias` 66%, `Vacaciones` 35%), correct per-activity
  color, and correct text/track colors in both light and dark mode; full 8-page smoke test shows
  zero console errors.
- Wiki `Deliverable-1` page updated to list `RadialProgress.vue` among the reusable components and
  document ApexCharts as the second visual library; README tech stack table updated.
