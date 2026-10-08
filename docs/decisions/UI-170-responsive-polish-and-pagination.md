# UI-170: Responsive layout, polished controls and paginated lists

## Status

Accepted

## Context

- On phones the tables scrolled sideways, the transaction filters filled half the screen, the KPI
  cards were very tall and the top bar repeated the browser title ("Transacciones | FinZen").
- Dates used the native `<input type="date">`, which looks different on every browser, and money
  fields were plain number inputs without thousands separators.
- The sidebar user card was misaligned, the edit and delete buttons were 6 px apart, and long lists
  grew without limit.
- The project rule is visual fidelity to the original prototype, so this is a refinement: palette,
  fonts (Manrope + Inter) and card shapes stay.

## Decision

- **Shared components** (domain-agnostic, typed props and emits, like the existing ones):
  - `DatePickerComponent`: ISO `v-model`, Spanish calendar starting on Monday, month picker,
    "Hoy" / "Borrar", `min` / `max`, keyboard navigation. It is teleported to `<body>` because the
    page wrapper's `fade-up` animation keeps a `transform`, which would trap a `position: fixed`
    popover; on phones it is a bottom sheet.
  - `MoneyInputComponent`: the model keeps only digits ("800000"), the field shows "800.000" and
    keeps the caret after the same digit while typing; `inputmode="numeric"`. Grouping is done by
    hand because `Intl` in Spanish does not group four-digit numbers.
  - `PaginatedListComponent`: receives the whole list and hands the current page to its slot
    (`v-slot="{ items: pagedAccounts }"`), so each view names the page after what it holds and
    no view repeats the page size, the page `ref` and the slicing `computed`. A view that filters
    passes a `:key` that changes with the filter to start again from page 1. The API keeps
    returning whole lists; paging happens on the loaded data, like the other calculations.
- **Utils:** `PaginationUtil` (`countPages`, `extractPage`, `buildPageList`) and
  `FormattersUtil.formatShortDate` ("28 dic 2026"), both pure and tested.
- **Tables become cards** through container queries (`container-type: inline-size` on
  `.table-wrap`), so they adapt to the space they get, including a tablet with the sidebar open,
  not only to the window width.
- **Global primitives** in `style.css`: buttons with one height scale, focus ring, disabled state
  and 44 px touch targets; selects with their own chevron; 16 px inputs on phones (iOS zooms into
  smaller fields); `.page-head` replaces the `.head` block repeated in every list view;
  `.action-pair` separates edit and delete (10 px, 12 px on touch screens).
- **Smaller fixes found on the way:** the default date of a new transaction was taken in UTC, so
  after 7 p.m. in Colombia it was already tomorrow; chart axes use `es-CO` compact numbers
  ("500 k", "1,5 M"); the recent transactions list no longer nests a card inside the overview
  panel.

## Consequences

- New forms reuse `DatePickerComponent` and `MoneyInputComponent` instead of native inputs, and
  new long lists wrap their content in `PaginatedListComponent`.
- `eslint.config.ts` declares the extra browser globals the new components use (`window`,
  `HTMLElement`, `KeyboardEvent`...), following the existing list of globals.
- The design detector only flags the Inter font, which is kept on purpose (original design).
