# DATA-06: Define DTOs for create and update operations

## What was done

- Created `CreateXxxDTO` for User, Account, Activity, and Transaction.
- Created `UpdateXxxDTO` for User, Account, Activity, and Transaction.
- Used TypeScript utility types (`Omit`, `Partial`) to derive all DTOs directly from the domain interfaces.

## Decisions

### 1. What are DTOs and why are they used?
A Data Transfer Object (DTO) is used to transport data between layers of the application. While an interface like `UserInterface` represents the perfect, complete entity (with `id`, `createdAt`, `updatedAt`), creating a user does not require these system-generated fields. Rather than making these fields optional in the core interface (which pollutes the domain model), we create DTOs representing the exact shape of the data needed for specific operations.

### 2. Using TypeScript Utility Types (`Omit` and `Partial`)
Instead of manually redefining fields, we derive DTOs from the core interfaces using TypeScript utilities to maintain a Single Source of Truth:
- **`Omit<Interface, 'field'>`**: Creates a clone of the interface excluding the specified fields (e.g., `CreateUserDTO` omits `id` and timestamps).
- **`Partial<Interface>`**: Creates a clone where all properties become optional. Used for `UpdateXxxDTO` since updates might only modify a subset of fields.

### 3. Using `import type`
We explicitly use `import type { InterfaceName }` instead of standard imports. This tells the compiler that the import is strictly for type-checking and should be completely stripped out in the final JavaScript bundle, resulting in faster builds and a lighter production bundle.

### 4. Separation of DTO files
Each DTO operation (Create and Update) was separated into its own file (e.g., `CreateUserDTO.ts` and `UpdateUserDTO.ts`). This explicitly fulfills the issue acceptance criteria which requested specific file names like `src/dtos/CreateUserDTO.ts`.

### 5. Utility Types over Manual Redefinition
By using `Omit<EntityInterface, 'id'>` and `Partial<Omit<EntityInterface, 'id'>>`, we guarantee that if the core domain interfaces change, the DTOs will automatically inherit those changes without requiring manual synchronization. This adheres strictly to the single source of truth principle.

## Validation

- Type checking passes successfully for these isolated files.
- The `CreateUserDTO` specifically omits `createdAt` and `updatedAt` alongside `id`, as users shouldn't provide timestamps on creation.
