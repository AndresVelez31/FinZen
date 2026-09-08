# FinZen · Personal Finance Manager

> A client-side Single Page Application for tracking accounts, transactions,
> budgets, savings goals, and personal-finance reports.
>
> University Project — Web Application Software Engineering (6th Semester).

## About the project

FinZen helps users understand their financial activity from a single interface. The application
supports:

- demo authentication with `user` and `admin` roles;
- personal accounts with calculated balances;
- income and expense transactions;
- expense budgets and savings goals organized as activities;
- filters, summaries, charts, and financial reports;
- user and activity administration through protected administrator routes;
- responsive light and dark themes.

Deliverable 1 is a **client-only SPA**. It has no application backend, remote API, or database.
Pinia holds the reactive state and `PiniaConfig.ts` persists it in the browser's `localStorage`
under the versioned key `finzenState.v2`.

Authentication and authorization are demonstrative only. Credentials and ownership checks run in
the browser and must not be treated as production-grade security.

## Technology stack

| Area             | Current implementation                                      |
| ---------------- | ----------------------------------------------------------- |
| UI framework     | Vue 3.5 with Composition API and `<script setup lang="ts">` |
| Language         | TypeScript 6 with strict compiler options                   |
| Build tool       | Vite 8 with `@vitejs/plugin-vue`                            |
| Routing          | Vue Router 5 with HTML5 history mode                        |
| State management | Pinia 4 Setup Stores                                        |
| Persistence      | Browser `localStorage` through `PiniaConfig.ts`             |
| Charts           | Chart.js 4 and ApexCharts 7 through `vue3-apexcharts`       |
| UI feedback      | SweetAlert2                                                 |
| Icons            | Lucide Vue Next                                             |
| Styling          | Project CSS plus Tailwind CSS 4 Vite integration            |
| Quality tools    | vue-tsc, OXLint, ESLint, and Prettier                       |
| Deployment       | Pre-built `dist` served by Nginx in Docker                  |

## Architecture

The main domain dependency direction is:

```text
Views -> Domain Services -> Pinia Stores -> localStorage
Views -> ReportAnalytics -> Domain Services
Views -> AuthService -> Auth/User Stores
```

- **Views** coordinate presentation state, navigation, dialogs, and chart configuration.
- **Services** implement domain validation, ownership rules, CRUD operations, and cascading changes.
- **Stores** are small reactive state containers.
- **ReportAnalytics** centralizes reporting and cross-entity calculations while returning plain data.
- **Shared components** remain domain-agnostic and communicate through typed props and emits.
- **PiniaConfig** hydrates, seeds, and persists the application state.

For the detailed rules, see the
[Programming Rules](https://github.com/AndresVelez31/FinZen/wiki/Programming-Rules).

## Repository structure

```text
FinZen/
├── docs/
│   ├── decisions/          # Architecture and implementation decision records
│   └── domain-model.md     # Domain-model reference
├── frontend/
│   ├── dist/               # Pre-built production output, intentionally tracked
│   ├── public/             # Static assets copied by Vite
│   ├── src/
│   │   ├── assets/         # Global styles
│   │   ├── auth/           # AuthService, auth store, and route guards
│   │   ├── components/     # Shared, layout, and feature components
│   │   ├── dtos/           # Create and Update DTO contracts
│   │   ├── interfaces/     # Domain interfaces
│   │   ├── router/         # Routes and route metadata
│   │   ├── seeders/        # Initial demonstration data
│   │   ├── services/       # Domain Services
│   │   ├── stores/         # Domain and theme Pinia Stores
│   │   ├── utils/          # Utilities, constants, and ReportAnalytics
│   │   ├── views/          # Routed page components
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── PiniaConfig.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── CONTRIBUTING.md
└── README.md
```

## Prerequisites

| Tool    | Required version                                       | Purpose                                        |
| ------- | ------------------------------------------------------ | ---------------------------------------------- |
| Node.js | `^22.18.0` or `>=24.12.0`                              | Development, checks, and production build      |
| npm     | A version compatible with the selected Node.js release | Dependency installation and project scripts    |
| Docker  | Optional                                               | Running the production Nginx container locally |

The commands below use npm and the committed `package-lock.json`. Prefer a current Node.js patch
release within the declared range to avoid engine warnings from transitive dependencies.

## Local installation

```bash
git clone https://github.com/AndresVelez31/FinZen.git
cd FinZen/frontend
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in the browser.

No project-specific environment variables are currently required.

## Demo data and credentials

On the first run, the application initializes:

- 2 users;
- 8 accounts;
- 14 activities;
- 80 transactions;
- an unauthenticated session.

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

## Available scripts

Run these commands from `frontend/`:

```bash
npm run dev          # Start the Vite development server
npm run type-check   # Run vue-tsc
npm run lint         # Run OXLint and ESLint with automatic fixes
npm run format       # Format src/ with Prettier
npm run build        # Type-check and create the Vite production build
npm run build-only   # Create the Vite production build without type-checking
npm run preview      # Preview the current production build
```

The `lint` and `format` scripts modify matching files. Consult the
[Coding Style Guide](https://github.com/AndresVelez31/FinZen/wiki/Coding-Style-Guide) before
contributing.

## Resetting demo data

To restore the initial seed data, open the browser developer console and run:

```javascript
localStorage.removeItem("finzenState.v2");
location.reload();
```

This removes only FinZen's persisted application state instead of clearing unrelated browser data.

## Production build and Docker

The Dockerfile does **not** install Node.js dependencies or compile the application. It copies the
existing `frontend/dist` directory into an `nginx:alpine` image. Rebuild `dist` before creating the
container whenever the source changes:

```bash
cd frontend
npm ci
npm run build
docker build -t finzen-frontend .
docker run --rm -p 8080:80 finzen-frontend
```

Open [http://localhost:8080](http://localhost:8080).

Nginx listens on internal HTTP port `80`, falls back to `index.html` for Vue Router paths, and serves
hashed files under `/assets/` with a one-year immutable cache policy. The repository does not
configure a domain, certificates, TLS termination, or external GCP infrastructure.

## Documentation

- [GitHub Wiki](https://github.com/AndresVelez31/FinZen/wiki) — Deliverable documentation and project architecture.
- [Main application screenshots](https://github.com/AndresVelez31/FinZen/wiki/Screenshots) — Overview, transactions, and reports.
- [Coding Style Guide](https://github.com/AndresVelez31/FinZen/wiki/Coding-Style-Guide) — Naming and code conventions.
- [Programming Rules](https://github.com/AndresVelez31/FinZen/wiki/Programming-Rules) — Layer responsibilities and dependency rules.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Branching, commit, and Pull Request workflow.
- [`docs/decisions/`](./docs/decisions) — Architecture and implementation decision records.
