# FinZen · Personal Expense Tracker

> SPA web application for smart personal finance management.  
> University Project — Web Application Software Engineering (6th Semester).

---

## What is FinZen?

FinZen is a Single Page Application (SPA) designed to help users:

- Record and categorize income and expenses through **transactions**.
- Organize money across multiple **accounts** (checking, savings, cash, digital).
- Group movements by **activities / categories** (food, transport, leisure, housing, etc.).
- Visualize financial health using **charts** and **analytical reports**.
- Manage **users** and roles (administrator / regular user).

Data is persisted in the browser's `localStorage` (client-side persistence without external backend in Deliverable 1).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API `<script setup lang="ts">`) |
| Build Tool | Vite 5 |
| Routing | Vue Router 4 |
| State Management | Pinia |
| Charts | Chart.js 4 |
| Icons | Lucide Vue Next |
| Alerts / Feedback | SweetAlert2 |
| Persistence | `localStorage` (Browser) |
| Language | TypeScript (Strict Mode) |

---

## Repository Structure

```
FinZen/
├── frontend/               ← Vue frontend source code
│   ├── public/             ← Static assets
│   ├── src/
│   │   ├── assets/         ← Global CSS
│   │   ├── components/     ← Reusable UI components
│   │   ├── data/           ← Demo seed data
│   │   ├── dtos/           ← Data Transfer Objects
│   │   ├── interfaces/     ← TypeScript domain contracts
│   │   ├── router/         ← Route configurations & navigation guards
│   │   ├── services/       ← Business logic layer (static classes)
│   │   ├── stores/         ← Pinia state stores & seeders
│   │   ├── utils/          ← Pure utility functions & formatters
│   │   ├── views/          ← Application page views
│   │   ├── App.vue         ← Root component (Layout Shell)
│   │   ├── main.js / ts    ← Application entry point
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js / ts
├── docs/                   ← Project documentation & wiki pages
├── .gitignore
├── README.md               ← This file
└── CONTRIBUTING.md         ← Team contribution guide & PR workflow
```

---

## Prerequisites

Before getting started, make sure you have installed:

| Tool | Minimum Version | Verify with |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18.x or higher | `node --version` |
| npm | 9.x or higher | `npm --version` |

> **How to install Node.js:**  
> Download the LTS installer from [nodejs.org](https://nodejs.org/). npm is included automatically.

---

## Local Installation and Execution

### Step 1 — Clone the repository

```bash
git clone https://github.com/AndresVelez31/FinZen.git
cd FinZen
```

### Step 2 — Navigate to the frontend directory

```bash
cd frontend
```

### Step 3 — Install dependencies

```bash
npm install
```

### Step 4 — Start the local development server

```bash
npm run dev
```

You should see output similar to:

```
  VITE v5.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://XXX.XXX.X.XXX:5173/
```

### Step 5 — Open in your browser

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Demo Credentials

The application automatically seeds demonstration data on the very first run.

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Administrator** | `admin@finzen.app` | `admin123` | Full system access (including Activities & Users management) |
| **Regular User** | `user@finzen.app` | `user123` | Dashboard, Transactions, Accounts, Reports |

---

## Available Pages

| Route | View | Description |
|---|---|---|
| `/login` | LoginView | User authentication |
| `/` | DashboardView | Financial overview with summary metrics and charts |
| `/transactions` | TransactionsView | Filterable transaction table |
| `/transactions/new` | TransactionFormView | Create transaction form |
| `/transactions/:id/edit` | TransactionFormView | Edit transaction form |
| `/accounts` | AccountsView | Accounts list with real-time balances |
| `/accounts/new` | AccountFormView | Create account form |
| `/reports` | ReportsView | Interactive Chart.js analytics |
| `/activities` | ActivitiesView *(admin)* | Category / activity management |
| `/users` | UsersView *(admin)* | User administration & role management |

---

## Available Scripts

Run from the `frontend/` folder:

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Reset Demo Data

To reset the mock data to its initial clean seeded state, open the browser developer console (`F12` → `Console`) and run:

```javascript
localStorage.clear()
location.reload()
```

---

## Documentation Links

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Branching, commits, and Pull Request workflow.
- [GitHub Wiki](https://github.com/AndresVelez31/FinZen/wiki) — Full project architecture, deliverable documentation, style guide, and programming rules.
