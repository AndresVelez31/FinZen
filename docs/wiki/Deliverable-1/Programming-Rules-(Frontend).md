# Programming Rules (Frontend)

Rules the team applies in every PR. A PR that breaks one is sent back citing the rule number.
The back-end rules are in [Programming Rules (Backend)](<Programming-Rules-(Backend)>).

## Views (`src/views/`)

1. `<script setup lang="ts">` only; no Options API.
2. A view never imports a store or axios: it only talks to services.
3. Data is loaded only inside `onMounted(async () => { ... })` into `ref`s, wrapped in
   `try/catch`; never with a top-level `await` in `<script setup>`. Event handlers that call the
   API (`submit`, `delete...`) are `async`, `await` the service inside `try/catch` and show the
   error with SweetAlert2. After a delete the list on screen is updated without reloading it.
4. Everything shown that depends on loaded data is a `computed`.
5. Forms validate their fields before calling the service (the API validates again).

## Services (`src/services/`)

6. A service only does CRUD with the API. It `extends BaseService`, has only static methods, each
   with an explicit access modifier (`public static`, `protected static` or `private static`), and
   keeps its route in `private static readonly PATH`. `AuthService` also exposes the session
   (`getCurrentUser`, `isAuthenticated`, `isAdmin`), because views cannot read stores.
   `AuthService.signIn()` and `AuthService.signUp()` (used by `SignInView` and
   `SignUpView`, which share `AuthLayoutComponent`) both start the session with the tokens
   the API returns.
7. `BaseService` is the only place with the axios `try/catch`, the base URL, the
   `Authorization` header. Services never repeat them. A `401` with both tokens renews them once
   with the refresh token (one renewal shared by concurrent requests, because a refresh token is
   single use) and retries the request; if the renewal fails, or any other `401` with a token
   arrives, the session ends. `AuthService.signOut()` ends the local session first and then
   revokes the refresh token.
8. Every function that returns a promise is `async` and uses `await`
   (`return await this.httpGet(...)`): `getAllByUserId`, `getByIdAndUserId`, `create`, `update`,
   `delete` (`UserService` keeps `getAll` and `update`: it lists every user for the administrator).
9. Calculations over data a view already loaded (filters, totals, progress) live in one util per
   service (`AccountUtil`, `ActivityUtil`, `TransactionUtil`) and receive that data as parameters.

## Stores (`src/stores/`)

10. Only the session (`authstore`: access token, refresh token and current user) and the theme
    (`themestore`).
11. No logic inside a store.

## Interfaces, DTOs, enums, utils

12. Every interface lives in `src/interfaces/`, one per file, named `<Name>Interface`: the four
    entities of the class diagram, the derived shapes (rows, totals, progress, token pair, filter
    options) and the ones a single view needs (form errors, nav items). None is declared inside a
    `.vue` file or a service.
13. DTOs are derived from interfaces with `Omit`, `Pick` and `Partial`, never redeclared.
14. Fixed option lists and shared constants go in `src/enums/constants.ts`.
15. Utils are pure classes named `<Name>Util`: no stores, no API, no side effects. Their methods
    are `public static` (or `private static` for internal helpers) and start with a verb that says
    what they do (`calculate`, `sum`, `filter`, `build`, `extract`...), never `get`
    (`AccountUtil.calculateBalance`, not `getBalance`).

## Components (`src/components/`)

16. Typed props with `defineProps<{ ... }>()` and typed `defineEmits`; no direct service calls in
    shared components.

## Routing and security

17. Every route has `meta.title`; private routes pass the auth guard and `/users` also needs the
    `admin` role. `/sign-in` and `/sign-up` are public.
18. Navigate with `router.push()` or `<RouterLink>`, never `window.location`.
19. The browser only hides what the user cannot do; the API is the one that enforces it.

## Environment

20. The API URL comes from `VITE_API_BASE_URL` (`.env`, see `.env.example`). `.env` is never
    committed.

## Naming

21. Names follow this table and are explicit: `transaction`, not `t`; `filterRole`, not `fRole`;
    `activitiesProgress`, not `cards`.

| Element | Convention | Example |
| --- | --- | --- |
| View (lists all records) | `<Entity>ShowView.vue` | `TransactionsShowView.vue` |
| View (create and edit) | `<Entity>FormView.vue` | `AccountFormView.vue` |
| Component | `<Name>Component.vue` | `StatCardComponent.vue` |
| Service | `<Entity>Service` class, same file name; route in `PATH` | `AccountService.ts` |
| Interface | `<Name>Interface`, one per file in `src/interfaces/` | `TransactionInterface.ts` |
| DTO | `<Action><Entity>DTO` | `CreateAccountDTO`, `UpdateUserDTO` |
| Util | `<Name>Util` class; one `<Entity>Util` per service for what is not CRUD | `FormattersUtil`, `TransactionUtil` |
| Store | `use<Name>Store` in `<name>store.ts` | `useAuthStore` in `authstore.ts` |
| Constant list | `UPPER_SNAKE_CASE` in `enums/constants.ts` | `MONTH_OPTIONS` |
| Variables and functions | `camelCase`, full words, verb for functions | `filterRole`, `deleteAccount()` |

## TypeScript and file layout

22. Strict mode (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
    `verbatimModuleSyntax`); `import type` for anything that is only a type; imports end in `.js`
    even when the file is `.ts` (`'@/services/AccountService.js'`); no `any` (use `unknown` and a
    local cast when a library forces it).
23. Every `.ts` and `.vue` file splits its imports in two blocks: `// External imports` (packages:
    `vue`, `axios`, `vitest`...) and `// Internal imports` (`@/...` and relative paths), separated
    by a blank line. A block without imports has no comment. Inside each block, imports are sorted
    alphabetically by path; a value import goes before a type import of the same path. `.ts` files
    put `// Exports` above what they export (above its comments and decorators).
24. `<script setup>` blocks use these section comments, in this order and only when the section
    has content: `// External imports`, `// Internal imports`, `// Types`, `// Props` /
    `// Emits`, `// Variables`, `// Reactive variables`, `// Selectors`, `// Computed`,
    `// Actions`, `// Watchers`, `// Lifecycle`.
    - `Variables`: values that are not reactive on their own: `useRoute()`, `useRouter()`,
      constants and `let` variables the template never reads (`chartInstance`).
    - `Reactive variables`: everything declared with `ref()`: API data, form fields, UI state.
    - `Selectors`: what feeds a filter or a picker: its options and the value the user picks
      (`filterRole`, `selectedMonth`). Option lists that never change and are shared go in
      `enums/constants.ts` (`MONTH_OPTIONS`) instead.
    - `Computed`: every other value declared with `computed()`.
    - `onMounted` always goes last, never between variables.
25. Comments are in English (Spanish only in text the user sees) and explain *why* (a domain rule,
    a workaround), never repeat what the code says.
