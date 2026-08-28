# INFRA-04: Configure Pinia with static PiniaConfig class

## What was done

- Created `src/PiniaConfig.ts` with a static `init()` method as per the architecture guide.
- Implemented `localStorage` state hydration and automatic persistence via `watch`.
- Updated `main.ts` to consume Pinia exclusively via `PiniaConfig.init()`.
- Added TODO stubs for seeders (which will be implemented in Issues #5-7) to populate state when no `localStorage` data exists.

## Decisions

### Why a static PiniaConfig class?
Instead of creating the Pinia instance anonymously in `main.ts`, the static `PiniaConfig` class centralizes all state initialization logic. This is the exact pattern from the course tutorials and prevents business logic (like seeders and persistence) from cluttering the application entry point.

### Why centralize localStorage here?
By using Vue's `watch` with `{ deep: true }` on `pinia.state`, any mutation across any store is automatically persisted to `localStorage` under the `finzenState` key. This completely eliminates the need for stores or views to manually call `localStorage.setItem`, ensuring a single source of truth for persistence.

### Why are seeders deferred?
The issue specifies running seeders if no `localStorage` state exists. However, the store schemas (Pinia) and the seeders themselves are scoped to future issues (#5, #6, #7, etc.). The logic branch for seeders has been left open via a `TODO` comment and will be filled in as the respective stores are built.

## Notes on validation
As documented in `INFRA-03-linting-setup.md`, `npm run type-check` and `npm run build` are expected to fail during this phase due to unmigrated views. Validation of this issue focuses solely on correct file structure and `main.ts` integration.
