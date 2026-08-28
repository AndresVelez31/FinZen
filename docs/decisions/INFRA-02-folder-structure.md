# INFRA-02: Folder Structure

## What was done

Created the complete `src/` folder structure required by the architecture guide.
Reorganized existing files from the JS prototype into the correct locations.

## Final `src/` structure

```
src/
├── assets/           ← Global styles and static resources
│   ├── style.css     (moved from src/style.css)
│   └── .gitkeep
├── components/
│   ├── layout/       ← App shell components (sidebar, header)
│   │   └── AppLayout.vue (existing — migrated to TypeScript)
│   └── shared/       ← Reusable UI components
│       ├── GraficoChart.vue
│       ├── SelectorFiltro.vue
│       ├── StatCard.vue
│       └── TablaGenerica.vue
├── dtos/             ← Data Transfer Objects (new — empty)
├── interfaces/       ← Domain interfaces (new — empty)
├── router/           ← Vue Router config (new — empty)
├── services/         ← Static service classes (new — empty)
├── stores/           ← Pinia stores (new — empty)
├── utils/            ← Pure utility functions (new — empty)
├── views/            ← Route-level views (existing)
├── App.vue           ← Restored to full version with AppLayout
└── main.ts           ← Updated to import assets/style.css
```

## Decisions

### Why `.gitkeep` in empty folders?
Git does not track empty directories. A `.gitkeep` file (empty by convention) forces
Git to include the directory in the repository. This ensures all team members have
the same folder structure when they clone the project.

### Why `components/layout/` and `components/shared/`?
The architecture guide distinguishes between:
- **Layout components**: structural shell of the app (sidebar, topbar, page wrapper) — used once
- **Shared components**: reusable UI primitives (cards, tables, charts) — used many times

Keeping them in separate subfolders avoids naming collisions and makes the codebase
easier to navigate as it grows.

### Why was `store/` deleted and `stores/` created?
The original `store/index.js` used Vuex/Options API style JavaScript.
The project architecture requires Pinia setup stores in TypeScript.
The folder is renamed to `stores/` (plural) to match the architecture guide exactly.
The Pinia stores will be implemented in **Issue #8**.

### Why was `data/` deleted?
`data/seed.js` contained hardcoded seed data in plain JavaScript.
The architecture guide places seeders in `stores/` as TypeScript files.
The seeders will be implemented in **Issue #7**.

### Why was `router/index.js` deleted?
It used the old Vue Router 4 / JavaScript API.
The router will be rebuilt in TypeScript with Vue Router 5 in **Issue #15**.

### Why was `App.vue` restored to its full version here?
In Issue #1, `App.vue` was kept minimal because `AppLayout.vue` didn't exist as a
TypeScript-compatible file. Now that `AppLayout.vue` has been migrated to
`<script setup lang="ts">`, the full `App.vue` (with layout switching and fade
transitions) can be restored.

### AppLayout.vue — temporary stubs
`AppLayout.vue` imports from `@/store` (which no longer exists). For this issue,
the store references are replaced with local `ref()` stubs so type-check passes.
These will be replaced with proper Pinia store calls in **Issue #4** and **Issue #8**.


### Clean Code Naming Conventions applied to AppLayout

As part of migrating `AppLayout.vue`, variable names were updated to reflect the project's Clean Code guidelines:
- `nav` -> `navItems`
- `mobileOpen` -> `isMobileMenuOpen`
- `initials` -> `userInitials`
- `go` -> `navigateTo`
- `store` -> `appTheme`
- `toggleTheme` -> `toggleAppTheme`
- `currentUser` -> `authenticatedUser`
- `isAdmin` -> `isAdminUser`
- `logout` -> `clearSession`

This ensures code is self-documenting and easier to read without context.
