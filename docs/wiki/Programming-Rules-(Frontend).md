# Programming Rules (Frontend)

Rules the team applies in every PR. A PR that breaks one is sent back citing the rule number.
The back-end rules are in [Programming Rules (Backend)](Programming-Rules-(Backend)).

## Views (`src/views/`)

1. `<script setup lang="ts">` only; no Options API.
2. A view never imports a store or axios: it only talks to services.
3. Data is loaded inside `onMounted(async () => { ... })` into `ref`s, wrapped in `try/catch`.
   No `await` at the top level of `<script setup>`.
4. Everything shown that depends on loaded data is a `computed`.
5. Asynchrony in a view only lives in `onMounted(async () => ...)`, whose loads are inside
   `try/catch`. Event handlers (`submit`, `delete...`) are not `async`: they chain the service
   promise with `.then()` / `.catch()` / `.finally()` and show the error with SweetAlert2 in
   `.catch()`. After a delete the list on screen is updated without reloading it.
6. Forms validate their fields before calling the service (the API validates again).

## Services (`src/services/`)

7. A service only does CRUD with the API. It `extends BaseService`, has only static methods, each
   with an explicit access modifier (`public static`, `protected static` or `private static`), and
   keeps its route in `private static readonly PATH`. `AuthService` also exposes the session
   (`getCurrentUser`, `isAuthenticated`, `isAdmin`), because views cannot read stores.
8. `BaseService` is the only place with the axios `try/catch`, the base URL, the
   `Authorization` header. Services never repeat them. A `401` with a token ends the session.
9. Every function that returns a promise is `async` and uses `await`
   (`return await this.httpGet(...)`): `getAll`, `getById`, `create`, `update`, `delete`.
10. Calculations over data a view already loaded (filters, totals, progress) live in one util per
    service (`AccountUtil`, `ActivityUtil`, `TransactionUtil`) and receive that data as parameters.

## Stores (`src/stores/`)

11. Only the session (`authstore`: access token and current user) and the theme
    (`themestore`).
12. No logic inside a store.

## Interfaces, DTOs, enums, utils

13. Every interface lives in `src/interfaces/`, one per file, named `<Name>Interface`: the four
    entities of the class diagram, the derived shapes (rows, totals, progress, token pair, filter
    options) and the ones a single view needs (form errors, nav items). None is declared inside a
    `.vue` file or a service.
14. DTOs are derived from interfaces with `Omit`, `Pick` and `Partial`, never redeclared.
15. Fixed option lists and shared constants go in `src/enums/constants.ts`.
16. Utils are pure classes named `<Name>Util`: no stores, no API, no side effects. Their methods
    are `public static` (or `private static` for internal helpers) and start with a verb that says
    what they do (`calculate`, `sum`, `filter`, `build`, `extract`...), never `get`
    (`AccountUtil.calculateBalance`, not `getBalance`).

## Components (`src/components/`)

17. Typed props with `defineProps<{ ... }>()` and typed `defineEmits`; no direct service calls in
    shared components.

## Routing and security

18. Every route has `meta.title`; private routes pass the auth guard and `/activities` and
    `/users` also need the `admin` role.
19. Navigate with `router.push()` or `<RouterLink>`, never `window.location`.
20. The browser only hides what the user cannot do; the API is the one that enforces it.

## Environment

21. The API URL comes from `VITE_API_BASE_URL` (`.env`, see `.env.example`). `.env` is never
    committed.
