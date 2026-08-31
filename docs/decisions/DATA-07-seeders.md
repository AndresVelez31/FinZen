# DATA-07: Create seeders with demo data

## What was done

- Created `src/stores/accountseeder.ts` with 4 accounts linked to the admin demo user.
- Created `src/stores/activityseeder.ts` with 7 activities (5 expense types, 2 savings types).
- Created `src/stores/transactionseeder.ts` with 30 transactions spread across 6 months (June–November 2025).
- Updated `src/PiniaConfig.ts` to import and load all seeders into the initial Pinia state on first launch.

## Decisions

### 1. Seeders are pure data — no logic
Following the tutorial architecture guide (`ARQUITECTURA.md`), seeders are typed arrays only. They do not contain functions, service calls, or computed values. The comment in the guide states:
> `bookseeder.ts — Solo los datos iniciales`

This principle is enforced in all four seeders.

### 2. Internal consistency of IDs
All IDs in `transactionseeder.ts` reference valid IDs from `accountseeder.ts` (`acc-1` to `acc-4`) and `activityseeder.ts` (`act-1` to `act-7`). All data references `userId: '1'`, which matches the admin user in `userseeder.ts`.

### 3. PiniaConfig is the bridge
The `PiniaConfig.ts` class is the only place that imports seeders and populates the initial Pinia state. No view, store, or service calls seeders directly. This respects the separation of responsibilities defined in the architecture.

### 4. The `else` branch = first launch
Seeder data is only injected into `pinia.state.value` inside the `else` block (i.e., when `localStorage` has no saved state). Immediately after seeding, `localStorage.setItem` is called **synchronously** to persist the initial state right away. This prevents a timing edge case where the user could close the browser before Vue's `watch` callback (which is asynchronous) fires. On subsequent launches, the stored state is restored and seeders are never re-run, preserving any changes the user made.

## Validation

- All referenced IDs are consistent across seeders.
- `npm run type-check` passes for the new seeder files.

