# Deliverable 1 — Base Architecture & Scope

This page contains items 1 to 4 of *Entregable 1 Parte 1 — Proyecto Front-end (SPA)*: team logo, verbal model, domain class diagram, and Front-end architecture diagram for **FinZen**.


## 1. Team Logo

<p align="center">
  <img src="https://raw.githubusercontent.com/wiki/AndresVelez31/FinZen/images/Logo%20FinZen.png" width="220"/>
</p>

<p align="center"><b>FinZen — Personal Finance. A Clearer Tomorrow.</b></p>

The mark combines a rising bar chart with an upward trend line to represent the goal of the application: turning scattered income and expenses into a clear, growing financial picture. The teal palette was chosen to evoke trust and stability, common associations with finance products.

---

## 2. Definitive Verbal Model

### What is FinZen?

FinZen is a Single Page Application (SPA) for **personal expense and finance management**. It lets a person centralize their financial life — accounts, transactions, and spending categories ("activities") — in one place, and turns that raw data into charts and reports that are easy to understand.

### Scope (Deliverable 1)

- The system is a **client-only SPA** built with Vue 3 + TypeScript. There is no remote backend/API in this deliverable.
- Data is persisted in the browser's **`localStorage`**, wrapped by Pinia stores. On first load, the app seeds realistic fictitious data (users, accounts, activities, and transactions) so the app is immediately navigable.
- Users can **authenticate**, manage **accounts** (checking, savings, cash, digital), record and edit **transactions** (income/expense), organize spending into **activities/categories**, and view **dashboards and reports** with Chart.js visualizations.
- **Administrators** additionally manage **activities** (categories) and **users** (roles), which are restricted from regular users via route guards.
- Out of scope for Deliverable 1: a remote database/API, multi-device sync, and notifications — these depend on `localStorage` being replaced by a real backend in a later deliverable.

### Actors

| Actor | Description |
|---|---|
| **Regular User** | Registered person who tracks their own accounts, transactions, and activities, and views their dashboard/reports. |
| **Administrator** | A user with the `admin` role. Has all Regular User capabilities plus access to the Activities and Users management pages. |
| **Browser / `localStorage`** | Not a human actor, but the only persistence layer in this deliverable — every read/write in the app ultimately goes through it. |

### Benefit / Value Proposition

Most people track their finances (if at all) across scattered notes, spreadsheets, or bank apps that don't talk to each other. FinZen gives a single, visual place to answer "where is my money going and am I on track?" — without requiring a signup to a third-party service, since Deliverable 1 runs entirely in the browser. For the course, it also serves as a controlled environment to practice a layered Vue 3 + TypeScript architecture (View → Service → Store) before a real backend is introduced.

---

## 3. Domain Class Diagram

The system is modeled around **four domain entities**, matching the interfaces in `src/interfaces/`. Persistence is flat (`localStorage`), so relationships are implemented with foreign keys (`userId`, `accountId`, `activityId`) rather than object references.

<img alt="Diagrama de Clases (Desarrollo Web)" src="https://github.com/user-attachments/assets/0931c15d-c288-4d97-99ee-1ddfe1138010" />


**Notes**

- `role` on `User` is either `"admin"` or `"user"`; `active` toggles whether the account can log in.
- `type` on `Account` distinguishes `checking / savings / cash / digital`; `type` on `Activity` and `Transaction` distinguishes `income / expense` (or `expense / savings` for the Activity's own type).
- There is **no direct `User ↔ Transaction` relationship** — a transaction is only reachable through its `Account` or `Activity`.
- Every entity above is mirrored by a strict TypeScript interface (`src/interfaces/`) and a pair of derived DTOs (`Create[Entity]DTO`, `Update[Entity]DTO`) in `src/dtos/`.

---

## 4. Architecture Diagram (Front-end SPA)

FinZen is deployed as a **static, client-only SPA**: the Vue build output is served by nginx inside a Docker container on a single GCP Compute Engine VM. There is no remote API — after the initial page load, all business logic runs in the browser, and the only persistence is `localStorage`, synchronized through Pinia.

<img alt="finzen-architecture" src="https://github.com/user-attachments/assets/a10328d3-396b-40d9-b91f-294ce8be5cf6" />


### Reading the diagram

- **Client ↔ Server:** the browser sends an HTTPS request for the static SPA files; the server (nginx on the GCP VM) responds with the built Vue app. From then on, the browser handles everything — there is no further request/response cycle with a remote API.
- **`src/router/`** maps URLs to **`src/views/`** (one view per page/route).
- Views use **`src/components/shared/`** (reusable UI: `SelectorFilter.vue`, `StatCard.vue`, `ChartGraphic.vue`, `RadialProgress.vue`, `TableSkeleton.vue`, `EmptyState.vue`) and feature-specific components (e.g., `transactions/TransactionsTable.vue`).
- Views call **`src/services/`** (`UserService`, `AccountService`, `ActivityService`, `TransactionService`) rather than touching Pinia stores directly.
- Services read/write **`src/stores/`** (Pinia), which are the source of reactive state and are **synchronized with `localStorage`**.
- **`src/auth/`** (`AuthService.ts`, `authstore.ts`, `guards.ts`) handles login, session state, and route guards, and reads the current user for ownership checks in services.
- **`src/interfaces/`** define the domain contracts; **`src/dtos/`** derive `Create/Update` DTOs from those interfaces; both are consumed by services and stores.
- **`src/utils/`** holds pure helpers (`formatters.ts`, `DateRange.ts`, `ReportAnalytics.ts`, `constants.ts`) used by views and components for formatting and aggregation, with no store/Vue dependencies.

This layered separation (**View → Service → Store → `localStorage`**) is enforced by the [Programming Rules (Frontend)](Programming-Rules-(Frontend)).
