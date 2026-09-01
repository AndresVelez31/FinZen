# SERVICE-11: Implement ActivityService

## What was done

- Created `src/services/ActivityService.ts` containing strictly static methods.
- Implemented `getActivities()`, `getActivityById()`, `createActivity()`, `updateActivity()`, `deleteActivity()`.
- Added basic input validation directly in the service methods (e.g., trimming names, validating required fields).

## Decisions

### 1. Static Method Pattern
Following the standard established in `UserService` and `AccountService`, all methods are static. This groups the domain rules into a single namespace without needing instantiation.

### 2. ID Generation
For `createActivity()`, IDs are generated numerically using `Date.now()` to strictly comply with the domain model (which enforces `id: number`). Timestamps (`createdAt` and `updatedAt`) are correctly assigned on creation and updates.

### 3. Cascade Deletion
`deleteActivity(id)` cascades the deletion to the transaction store, removing any transactions that are linked to the deleted activity.

## Validation

- Verified that all inputs are correctly checked in the Service, not the Views.
- Ensured strict typing matching the Domain Model.
- `npm run type-check` passes cleanly for the service file.
