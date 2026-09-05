# DATA-80: Separate seeders into a dedicated folder

## What was done

- Created `src/seeders/`.
- Moved `userseeder.ts`, `accountseeder.ts`, `activityseeder.ts`, and
  `transactionseeder.ts` from `src/stores/` to `src/seeders/` via `git mv`, to
  preserve file history instead of showing up as delete+add.
- Updated the four import paths in `PiniaConfig.ts` (the only file that imports
  seeders directly) from `@/stores/...seeder.js` to `@/seeders/...seeder.js`.

## Decisions

### No content changes inside the seeder files
Each seeder only imports its corresponding `*Interface` type from
`src/interfaces/`, which didn't move. So the relocation required zero changes to the
seeders themselves — only the import paths in the one consumer (`PiniaConfig.ts`)
needed updating.

### Stores are untouched
None of the four stores (`userstore.ts`, `accountstore.ts`, `activitystore.ts`,
`transactionstore.ts`) import their seeder directly — seeding only happens once, in
`PiniaConfig.ts`, which assigns seeded arrays into `pinia.state.value` before the
stores are ever used. This confirms the professor's premise: stores were already
logic/seed-free containers of reactive state; the only cleanup needed was the file
location.

## Validation

- `npm run type-check`: no errors.
- `npm run lint`: 13 pre-existing errors reported, none in `PiniaConfig.ts` beyond the
  already-known `localStorage` global gap, and none referencing `src/seeders/` or
  `src/stores/`. Confirms the move didn't break anything.
- Manual test: cleared `localStorage` (`finzenState`) to force a fresh seed, reloaded,
  logged in, and confirmed Dashboard/Accounts/Activities/Transactions all show the
  same demo data as before the move.