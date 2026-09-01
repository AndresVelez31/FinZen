# Programming Rules & Architecture Standards

This document establishes the mandatory programming rules for developing in the **FinZen** codebase. Every team member must adhere to these rules. Any pull request violating them will be rejected and redirected to this document.

---

## 1. Rules for Routes & Navigation (`src/router/`)

1. **Every page route must be associated with a dedicated View component.**
2. **Every View file representing a page must end with `View`** (e.g., `DashboardView.vue`, `TransactionsShowView.vue`). For an entity with full CRUD, the two views are `<Entity>ShowView.vue` (lists all — FinZen uses `Show` for "all", not the generic REST `Index`, see `GUIA_ARQUITECTURA...md` §19.1) and `<Entity>FormView.vue` (create/edit, shared).
3. **Use `createWebHistory`** for clean, standard browser URLs.
4. **Define `meta.title` on every route** for page title consistency.
5. **Private routes must enforce authentication guards.**
6. **Administrative routes (`/activities`, `/users`) must enforce role guards (`admin` only).**
7. **Never perform arbitrary navigation using `window.location.href`.** Use `router.push()` or `<RouterLink>`.

---

## 2. Rules for Services (`src/services/`)

1. **Services are implemented as classes with static methods.**
   ```typescript
   export class TransactionService {
     static getTransactions(): TransactionInterface[] { ... }
     static createTransaction(dto: CreateTransactionDTO): void { ... }
   }
   ```
2. **Services represent the domain business logic layer.**
3. **All business validations, sanitization (`.trim()`), and calculations belong in Services.**
4. **Services read from and mutate Stores.**
5. **Services must NEVER import Vue components or render HTML.**

---

## 3. Rules for Views (`src/views/`)

1. **All Views must be Single File Components (SFC) using `<script setup lang="ts">`.**
2. **Options API is strictly prohibited.**
3. **Views must NEVER access or mutate Pinia Stores directly.**
   ```typescript
   // ❌ PROHIBITED
   const store = useTransactionStore();
   store.transactions.push(newTx);

   // ✅ REQUIRED
   TransactionService.createTransaction(dto);
   ```
4. **Views only coordinate UI, fetch data through Services, and manage local presentation state.**
5. **Views must handle 4 UI states when displaying data:**
   - ⏳ `Loading state`
   - ✅ `Success state`
   - 📭 `Empty state` (e.g., "No transactions found for the selected filter")
   - ❌ `Error state`
6. **Use `computed` for derived values** instead of duplicating state or manually watching refs.

---

## 4. Rules for Components (`src/components/`)

1. **Components must be reusable and have a single clear presentation responsibility.**
2. **Props must use TypeScript generic definitions:**
   ```typescript
   // ✅ Correct
   const props = defineProps<{
     columns: ColumnDefinition[];
     rows: Record<string, unknown>[];
   }>();

   // ❌ Incorrect
   const props = defineProps({ columns: Array });
   ```
3. **Generic components (`TablaGenerica`, `SelectorFiltro`, `GraficoChart`) must not know domain entity specifics.**
4. **Components communicate with parents strictly via `props` and `emit`.**

---

## 5. Rules for Stores (`src/stores/`)

1. **Use Pinia Setup Stores syntax exclusively:**
   ```typescript
   export const useTransactionStore = defineStore('transaction', () => {
     const transactions = ref<TransactionInterface[]>([]);
     return { transactions };
   });
   ```
2. **Stores must remain lean containers of reactive state.**
3. **Stores must NOT contain complex business calculations, form validations, or router redirects.**
4. **Seeders must be separated into their own files** (e.g., `transactionseeder.ts`).

---

## 6. Rules for Interfaces & DTOs

1. **Every domain entity must have a strict interface in `src/interfaces/`.**
2. **Interfaces must only define type contracts — no executable code.**
3. **DTOs in `src/dtos/` must be derived from interfaces** using `Omit`, `Pick`, and `Partial`.

---

## 7. Rules for Environment Variables

1. **All environment configurations must live in `.env` files.**
2. **Never hardcode secrets, base URLs, or configurable credentials in source files.**
3. **A `.env.example` file must always be committed** containing placeholder template keys.
4. **`.env` files containing real secrets are strictly ignored in `.gitignore`.**

---

## 8. Peer Review & Architecture Policy

> **Golden Rule**: If a pull request or commit violates the architectural guidelines or programming rules defined above:
> 1. Request changes immediately on the PR.
> 2. Cite the specific rule in this document.
> 3. Do not merge until code complies with the layered standard.
