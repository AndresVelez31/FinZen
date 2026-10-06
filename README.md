# FinZen · Personal Finance Manager

> A client-side Single Page Application for tracking accounts, transactions,
> budgets, savings goals, and personal-finance reports.
>
> University Project — Web Application Software Engineering (6th Semester).

## Project team

- Sebastian Salazar Henao
- Andres Felipe Velez Alvarez
- Nathalia Cardoza

## About the project

FinZen helps users understand their financial activity from a single interface. The application
supports:

- login with `@nestjs/authentication` (JWT access token) and `user` / `admin` roles;
- personal accounts with calculated balances;
- income and expense transactions;
- expense budgets and savings goals organized as activities;
- filters, summaries, charts, and financial reports;
- user and activity administration through protected administrator routes;
- responsive light and dark themes.

Since Deliverable 2 the project is **full stack**:

- `frontend/` — Vue SPA. Its services call the API with axios; Pinia only keeps the session
  (access token, refresh token and current user) and the theme, persisted in `localStorage` under
  `finzenState.v5`.
- `backend/` — NestJS REST API under `/api`, with TypeORM over SQLite. The schema and the demo
  data are created by migrations.

The API requires a valid access token on every route except `/api` and `/api/auth/token/*`, only
returns the
records of the authenticated user, and restricts user and activity administration to admins.

## Technology stack

| Area             | Current implementation                                      |
| ---------------- | ----------------------------------------------------------- |
| UI framework     | Vue 3.5 with Composition API and `<script setup lang="ts">` |
| Language         | TypeScript 6 with strict compiler options                   |
| Build tool       | Vite 8 with `@vitejs/plugin-vue`                            |
| Routing          | Vue Router 5 with HTML5 history mode                        |
| State management | Pinia 4 Setup Stores                                        |
| HTTP client      | axios, wrapped by `BaseService`                             |
| Backend          | NestJS 12, TypeORM 1, SQLite (`better-sqlite3`)             |
| Authentication   | `@nestjs/authentication` (JWT bearer token, scrypt)         |
| Charts           | Chart.js 4 and ApexCharts 7 through `vue3-apexcharts`       |
| UI feedback      | SweetAlert2                                                 |
| Icons            | Lucide Vue Next                                             |
| Styling          | Project CSS plus Tailwind CSS 4 Vite integration            |
| Quality tools    | vue-tsc, OXLint, ESLint, Prettier, and Vitest               |
| CI               | GitHub Actions: lint, tests, build, and Docker smoke test   |
| Deployment       | Multi-stage Docker images (Nginx + Node) built on the VM    |

## Architecture

The main domain dependency direction is:

```text
Frontend:  Views -> Services (extend BaseService) -> axios -> API REST
           AuthService -> Auth Store (token + current user) -> localStorage
Backend:   Controller -> Service -> TypeORM Repository -> SQLite
```

- **Views** load their data only inside `onMounted`, always within `try/catch`, and derive
  everything else with `computed`. Event handlers that call the API are `async`: they `await`
  the service inside `try/catch`.
- **Services** only do CRUD with the API. They extend `BaseService`, the only place with the axios
  `try/catch`, the `Authorization` header and the error handling.
- **Utils** hold the calculations over data a view already loaded, one per service
  (e.g. `TransactionUtil.summarizeIncomeAndExpense`, `ActivityUtil.calculateTargetProgress`,
  `AccountUtil.calculateBalance`).
- **Stores** only keep the session and the theme.
- **Backend modules** (`auth`, `users`, `accounts`, `activities`, `transactions`) own their
  controller, service, validator, entity and DTOs. The `<feature>.validate.ts` validator checks the
  fields of a body; the service keeps persistence, ownership and cascading deletes;
  a global `ValidationPipe` (`class-validator`) checks the DTOs of the token routes and answers
  `400` with a single Spanish `message`.

For the detailed rules, see the
[Programming Rules (Frontend)](<https://github.com/AndresVelez31/FinZen/wiki/Programming-Rules-(Frontend)>).

## Repository structure

```text
FinZen/
├── backend/                # NestJS REST API
│   ├── src/
│   │   ├── accounts/       # Module: controller, service, entity, DTOs
│   │   ├── activities/
│   │   ├── auth/           # Token routes, JwtAuthProvider, RolesGuard, @Roles()
│   │   ├── database/       # DataSource and migrations (schema + demo data)
│   │   ├── home/
│   │   ├── transactions/
│   │   ├── users/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── decisions/          # Architecture and implementation decision records
│   └── domain-model.md     # Domain-model reference
├── frontend/
│   ├── public/             # Static assets copied by Vite
│   ├── src/
│   │   ├── assets/         # Global styles
│   │   ├── auth/           # Route guards
│   │   ├── components/     # Shared, layout, and feature components
│   │   ├── dtos/           # Create and Update DTO contracts
│   │   ├── enums/          # Fixed option lists (e.g. MONTH_OPTIONS)
│   │   ├── interfaces/     # Every interface, one per file (entities and derived shapes)
│   │   ├── router/         # Routes and route metadata
│   │   ├── services/       # BaseService and one CRUD service per entity
│   │   ├── stores/         # Auth and theme Pinia Stores
│   │   ├── utils/          # Pure utilities, one <Entity>Util per service
│   │   ├── views/          # Routed page components
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── PiniaConfig.ts
│   ├── tests/              # Vitest unit tests
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── deploy.sh               # Sets the VM IP and runs docker compose up -d --build
├── docker-compose.yml
├── CONTRIBUTING.md
└── README.md
```

## Prerequisites

| Tool    | Required version                                       | Purpose                                     |
| ------- | ------------------------------------------------------ | ------------------------------------------- |
| Node.js | `^22.18.0` or `>=24.12.0`                              | Development, checks, and production builds  |
| npm     | A version compatible with the selected Node.js release | Dependency installation and project scripts |
| Docker  | Optional                                               | Running both projects with Docker Compose   |

## Local installation

Start the API first (terminal 1):

```bash
cd FinZen/backend
npm ci
npm run start:dev
```

The first start creates `backend/database.sqlite` and runs the migrations (schema + demo data).
The API answers at [http://localhost:3000/api](http://localhost:3000/api).

Then the SPA (terminal 2):

```bash
cd FinZen/frontend
npm ci
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in the browser.

| Variable            | Project  | Default                | Purpose                           |
| ------------------- | -------- | ---------------------- | --------------------------------- |
| `VITE_API_BASE_URL` | frontend | —                      | API origin used by `BaseService`  |
| `PORT`              | backend  | `3000`                 | HTTP port                         |
| `SQLITE_PATH`       | backend  | `database.sqlite`      | SQLite file                       |
| `CORS_ORIGIN`       | backend  | `localhost` origins    | Comma-separated allowed origins   |
| `JWT_SECRET`        | backend  | development-only value | Signs the tokens (32+ characters) |

## Demo data and credentials

The `SeedDemoData` and `SeedDemoDataUntilDecember` migrations insert:

- 2 users;
- 8 accounts;
- 14 activities;
- 125 transactions, from February to December 2026 (80 from `SeedDemoData` and 45 for October
  to December from `SeedDemoDataUntilDecember`).

| Role          | Email              | Password   | Access scope                                        |
| ------------- | ------------------ | ---------- | --------------------------------------------------- |
| Administrator | `admin@finzen.app` | `admin123` | All protected pages, including Activities and Users |
| Regular user  | `user@finzen.app`  | `user123`  | Overview, Accounts, Transactions, and Reports       |

## Application routes

The router currently defines **13 routes**.

| Path                     | Route name            | View                       | Access        |
| ------------------------ | --------------------- | -------------------------- | ------------- |
| `/login`                 | `login`               | `LoginView.vue`            | Public        |
| `/`                      | `overview`            | `OverviewView.vue`         | Authenticated |
| `/transactions`          | `transactions`        | `TransactionsShowView.vue` | Authenticated |
| `/transactions/new`      | `transactions.create` | `TransactionFormView.vue`  | Authenticated |
| `/transactions/:id/edit` | `transactions.edit`   | `TransactionFormView.vue`  | Authenticated |
| `/accounts`              | `accounts`            | `AccountsShowView.vue`     | Authenticated |
| `/accounts/new`          | `accounts.create`     | `AccountFormView.vue`      | Authenticated |
| `/accounts/:id/edit`     | `accounts.edit`       | `AccountFormView.vue`      | Authenticated |
| `/reports`               | `reports`             | `ReportsView.vue`          | Authenticated |
| `/activities`            | `activities`          | `ActivitiesShowView.vue`   | Administrator |
| `/activities/new`        | `activities.create`   | `ActivityFormView.vue`     | Administrator |
| `/activities/:id/edit`   | `activities.edit`     | `ActivityFormView.vue`     | Administrator |
| `/users`                 | `users`               | `UsersShowView.vue`        | Administrator |

The account form currently provides five account types: `Corriente`, `Ahorros`, `Efectivo`,
`Digital`, and `Inversión`. Activities use `expense` or `savings`; transactions use `income` or
`expense`.

## API endpoints

All routes live under `/api` and require `Authorization: Bearer <token>` unless marked public.
Every list only contains the authenticated user's records; someone else's record answers `404`.

| Method                      | Path                      | Access        | Description                                                                                           |
| --------------------------- | ------------------------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| `GET`                       | `/api`                    | Public        | Health check                                                                                          |
| `POST`                      | `/api/auth/token`         | Public        | Sign in: returns the `accessToken` (8 hours) and the `refreshToken` (7 days, renewable up to 30 days) |
| `POST`                      | `/api/auth/token/refresh` | Public        | Exchanges the refresh token for a new pair; `401` if invalid, expired or reused                       |
| `POST`                      | `/api/auth/token/revoke`  | Public        | Sign out: revokes the refresh token (`204`)                                                           |
| `GET`                       | `/api/me`                 | Authenticated | The signed-in user (never the password)                                                               |
| `GET` / `POST`              | `/api/accounts`           | Authenticated | List / create accounts                                                                                |
| `GET` / `PATCH` / `DELETE`  | `/api/accounts/:id`       | Authenticated | Read / update / delete (cascades transactions)                                                        |
| `GET` / `POST`              | `/api/transactions`       | Authenticated | List (newest first) / create                                                                          |
| `GET` / `PATCH` / `DELETE`  | `/api/transactions/:id`   | Authenticated | Read / update / delete                                                                                |
| `GET`                       | `/api/activities[/:id]`   | Authenticated | List / read activities                                                                                |
| `POST` / `PATCH` / `DELETE` | `/api/activities[/:id]`   | Administrator | Manage activities (delete cascades transactions)                                                      |
| `GET`                       | `/api/users`              | Administrator | List users                                                                                            |
| `PATCH`                     | `/api/users/:id`          | Administrator | Change `role` and/or `active` (not your own user)                                                     |

## Available scripts

From `frontend/`:

```bash
npm run dev          # Start the Vite development server
npm run type-check   # Run vue-tsc
npm run lint         # Run OXLint and ESLint with automatic fixes
npm run check:lint   # Run OXLint and ESLint without modifying files (used in CI)
npm run test:unit    # Run the Vitest unit tests in tests/ once
npm run format       # Format src/ with Prettier
npm run build        # Type-check and create the Vite production build
```

From `backend/`:

```bash
npm run start:dev          # Start the API in watch mode
npm run build              # Compile to dist/
npm run lint               # Run OXLint (type-aware)
npm run format             # Format src/ with Prettier
npm run migration:generate -- src/database/migrations/<Name>   # New migration from entity changes
npm run migration:run      # Apply pending migrations (the app also runs them on start)
npm run migration:revert   # Undo the last migration
```

The `lint` and `format` scripts modify matching files. Consult the
[Coding Style Guide (Frontend)](<https://github.com/AndresVelez31/FinZen/wiki/Coding-Style-Guide-(Frontend)>) before
contributing.

## Resetting demo data

Stop the API, delete `backend/database.sqlite` and start it again: the migrations recreate the
schema and the demo data. To end the browser session, log out or run
`localStorage.removeItem("finzenState.v5")` in the developer console.

## Production build and Docker

`dist/` is not committed. Both Dockerfiles are multi-stage (Presentation 12): a `builder` stage
installs every dependency and runs `npm run build`, and the final image only keeps the output
(`dist/` plus production dependencies for the API, the static files for Nginx). The VM therefore
needs enough memory to build (the class uses a bigger machine than in Tutorial 08).

On the VM, replace `YOUR_VM_IP` in [`deploy.sh`](./deploy.sh) with its external IP and run:

```bash
cp .env.example .env    # set JWT_SECRET
bash deploy.sh          # exports VITE_API_BASE_URL and CORS_ORIGIN, then docker compose up -d --build
```

`VITE_API_BASE_URL` is passed as a build argument because Vite embeds it in the bundle.
`docker-compose.yml` starts the API on port `3000` (SQLite in the `backend-data` volume) and the
Nginx frontend on port `80`.

## Continuous integration

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs once on every Pull Request to
`main` (it tests the PR merged with `main`, so merging does not run it again):

1. **build-test** — frontend: `npm ci`, `check:lint`, `test:unit`, and `build` (type-check + Vite
   build).
2. **backend** — `npm ci`, `lint`, and `build`.
3. **docker** — builds both multi-stage images from the repository and checks that the Nginx
   image answers `/` and `/transactions`.

See [`docs/decisions/INFRA-ci-workflow.md`](./docs/decisions/INFRA-ci-workflow.md).

## Documentation

- [GitHub Wiki](https://github.com/AndresVelez31/FinZen/wiki) — Deliverable documentation and project architecture.
- [Main application screenshots](https://github.com/AndresVelez31/FinZen/wiki/Screenshots) — Overview, transactions, and reports.
- [Coding Style Guide (Frontend)](<https://github.com/AndresVelez31/FinZen/wiki/Coding-Style-Guide-(Frontend)>) — Naming and code conventions.
- [Programming Rules (Frontend)](<https://github.com/AndresVelez31/FinZen/wiki/Programming-Rules-(Frontend)>) — Layer responsibilities and dependency rules.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Branching, commit, and Pull Request workflow.
- [`docs/decisions/`](./docs/decisions) — Architecture and implementation decision records.
