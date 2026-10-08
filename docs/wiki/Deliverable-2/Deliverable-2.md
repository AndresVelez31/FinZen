# Deliverable 2 — Full Stack (Vue.js + Nest.js)

All diagrams are made in draw.io with the notation of the course slides (Client / Server frames,
blue projects, packages, grey modules, white classes/files, orange request/response arrows and
black communication arrows). The editable `.drawio` sources are in the repository under `docs/architecture/deliverable-2/`
and in this wiki under `images/deliverable-2/`.

## 1. Class diagram

The domain has four classes and four one-to-many relations. In the database every relation is a
foreign key (`userId`, `accountId`, `activityId`) with `ON DELETE CASCADE`.

![Class diagram](https://raw.githubusercontent.com/wiki/AndresVelez31/FinZen/images/deliverable-2/class-diagram.png)

## 2. Architecture diagrams

### 2.1 General view (clients, SPA and API REST)

The browser downloads the SPA from the Nginx container and then the SPA services call the API REST
with axios, sending the JWT in every request.

![General architecture](https://raw.githubusercontent.com/wiki/AndresVelez31/FinZen/images/deliverable-2/general-architecture.png)

### 2.2 Front-end (SPA)

Layers: router and guards, views, components, services (`BaseService` + one service per entity),
stores (session and theme), and the types and helpers (interfaces, DTOs, enums, utils).

![Front-end architecture](https://raw.githubusercontent.com/wiki/AndresVelez31/FinZen/images/deliverable-2/frontend-architecture.png)

### 2.3 Back-end (API REST)

Layers: `main.ts` and `app.module.ts`, one module per entity (controller → service → TypeORM
repository → entity), the `auth` module with the global guards, and the database layer
(data source + migrations).

![Back-end architecture](https://raw.githubusercontent.com/wiki/AndresVelez31/FinZen/images/deliverable-2/backend-architecture.png)

## 3. Pages added to the wiki

- [Coding Style Guide (Backend)](Coding-Style-Guide-(Backend))
- [Programming Rules (Backend)](Programming-Rules-(Backend))
