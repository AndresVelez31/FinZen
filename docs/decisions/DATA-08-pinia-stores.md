# DATA-08: Create Pinia setup stores

## What was done

- Created `src/stores/accountstore.ts` using the Pinia Setup Store syntax.
- Created `src/stores/activitystore.ts` using the Pinia Setup Store syntax.
- Created `src/stores/transactionstore.ts` using the Pinia Setup Store syntax.
- Validated that `userstore.ts` already follows this syntax correctly.

## Decisions

### 1. Setup Store Syntax
All stores use the Composition API syntax (`defineStore('name', () => { ... })`) instead of the Options API syntax (`defineStore('name', { state: () => ({ ... }) })`). This aligns with the Vue 3 Composition API standard enforced in the project architecture guidelines, allowing better TypeScript inference and more flexible reactivity primitives.

### 2. State-Only Stores
Following the strict separation of responsibilities defined in `ARQUITECTURA.md`, these stores **only** hold reactive state (`ref`). They do not contain getters with complex logic, business rules, API calls, or service logic. Any manipulation of this state must be done by dedicated Service classes (which will be implemented in subsequent issues).

## Validation

- Verified that stores export the state correctly using `ref`.
- Checked that `type-check` passes for these isolated store files.

## Date

2026-08-31
