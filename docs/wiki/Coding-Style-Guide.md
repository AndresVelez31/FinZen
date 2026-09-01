# Coding Style Guide

This document defines the team's coding conventions, code formatting standards, and linter usage guidelines.

---

## 1. Naming Conventions

| Category | Convention | Pattern | Example |
|---|---|---|---|
| **Classes / Services** | PascalCase | `[Domain]Service` | `TransactionService`, `AccountService` |
| **Interfaces** | PascalCase | `[Domain]Interface` | `TransactionInterface`, `UserInterface` |
| **DTOs** | PascalCase | `[Action][Domain]DTO` | `CreateTransactionDTO`, `UpdateAccountDTO` |
| **Vue Views** | PascalCase | `[Domain]ShowView.vue` (listar todos) / `[Domain]FormView.vue` (crear/editar) | `DashboardView.vue`, `TransactionsShowView.vue` |
| **Vue Components** | PascalCase | `[Name].vue` | `GenericTable.vue`, `StatCard.vue` |
| **Stores** | camelCase | `[domain]store.ts` | `transactionstore.ts`, `userstore.ts` |
| **Seeders** | camelCase | `[domain]seeder.ts` | `transactionseeder.ts`, `accountseeder.ts` |
| **Variables / Properties** | camelCase | `[description]` | `selectedTransaction`, `totalBalance` |
| **Functions / Methods** | camelCase | `[verb][Noun]` | `formatToCOP()`, `getTransactions()` |
| **Constants (domain)** | camelCase | `[description]` | `transactionSeedData` |

---

## 2. TypeScript Guidelines

### Strict Mode
TypeScript runs in strict mode. The following configurations are mandatory:
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `verbatimModuleSyntax: true`
- `isolatedModules: true`

### No Unjustified `any`
```typescript
// ❌ Incorrect
const tx: any = getTx();

// ✅ Correct
const tx: TransactionInterface = TransactionService.getTransactionById(id);
```

### Explicit `import type`
Because `verbatimModuleSyntax` is enabled, always use `import type` when importing types or interfaces:
```typescript
// ❌ Incorrect
import { TransactionInterface } from '@/interfaces/TransactionInterface.js';

// ✅ Correct
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
```

### Derived DTOs (Never Re-declare fields manually)
```typescript
// ❌ Incorrect: Manual duplication
export interface CreateTransactionDTO {
  userId: string;
  accountId: string;
  amount: number;
}

// ✅ Correct: Derived using TypeScript utility types
export type CreateTransactionDTO = Omit<TransactionInterface, 'id'>;
export type UpdateTransactionDTO = Partial<Omit<TransactionInterface, 'id'>>;
```

---

## 3. Formatting Standards (Prettier)

Our `.prettierrc.json` configuration:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all",
  "tabWidth": 2
}
```

### Running Formatter
```bash
# Format all files in frontend
npm run format
```

---

## 4. Linter & Type-Checking (ESLint / vue-tsc)

The project uses ESLint and TypeScript Compiler (`vue-tsc`) to enforce cleanliness and catch bugs before commit.

### Available Quality Scripts
Run these from the `frontend/` directory:

```bash
# Check TypeScript compilation without emitting JS
npm run type-check

# Run ESLint to detect stylistic and logical issues
npm run lint

# Format code automatically
npm run format

# Full production build check
npm run build
```

---

## 5. Clean Code Principles

1. **Single Responsibility**: Every function, component, and class does exactly one thing well.
2. **Early Returns (Guard Clauses)**: Avoid nested `if/else` ladders. Validate early and return.
3. **Pure Utilities**: Helper functions in `src/utils/` must be pure functions with no side effects and no Vue/Pinia store dependencies.
4. **Sanitize Inputs**: Form inputs must be trimmed and sanitized in the Service before mutation.
