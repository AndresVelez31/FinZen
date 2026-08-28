# DATA-05: Define Domain Interfaces

## What was done

- Created `src/interfaces/UserInterface.ts`
- Created `src/interfaces/AccountInterface.ts`
- Created `src/interfaces/ActivityInterface.ts`
- Created `src/interfaces/TransactionInterface.ts`

## Decisions

### 1. Named Exports vs Default Exports
We explicitly chose to use **named exports** (`export interface UserInterface`) instead of default exports (`export default interface UserInterface`). 

**Why?**
- **Consistency**: Named exports force the consumer to use the exact name of the interface when importing (e.g., `import { UserInterface } from '...'`), avoiding arbitrary naming (`import AnyName from '...'`).
- **Grep-ability**: It makes searching for interface usages across the codebase much easier.
- **Alignment with Clean Code**: Enforces a ubiquitous language where domain entities have a single, unchangeable name throughout the app.

### 2. Separation of Concerns
These files contain **only** TypeScript interfaces. They do not contain runtime logic, state management, or Vue dependencies. This ensures that the domain layer is completely decoupled from the framework (Vue) and state container (Pinia).

## Validation

- Type checking passes successfully for these isolated files.
- Global `type-check` and `build` commands will continue to fail until the stores (Issues #6-8) are implemented and the old `src/store` is fully migrated.

