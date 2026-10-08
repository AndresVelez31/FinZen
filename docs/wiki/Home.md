<p align="center">
  <img
    src="https://raw.githubusercontent.com/wiki/AndresVelez31/FinZen/images/Logo%20FinZen.png"
    alt="FinZen Team Logo"
    width="420"
  />
</p>

# Welcome to the FinZen Project Wiki

> **FinZen** is a full stack application for managing personal accounts, transactions, budgets,
> savings goals, and financial reports: a Vue 3 SPA backed by a Nest.js REST API with TypeORM and SQLite.

# FinZen Team

The **FinZen Team** identity represents collaboration, innovation, and a shared commitment to building clear and reliable solutions. The blue tones communicate trust, responsibility, and technological knowledge, while the green tones represent growth, balance, and financial well-being. The upward line symbolizes the team's continuous improvement and its goal of helping people make better financial decisions.

More than representing the application, the logo gives the team a recognizable identity. It reflects how its members work with one voice, follow the same development standards, and combine their skills to produce consistent, well-prepared, and high-quality results.

## Team members

| Name | GitHub username | Role |
|---|---|---|
| **Andrés Felipe Vélez Álvarez** | [@AndresVelez31](https://github.com/AndresVelez31) | Software Architect & Developer |
| **Sebastian Salazar Henao** | [@Salazar1022](https://github.com/Salazar1022) | Fullstack Developer |
| **Nathalia Valentina Cardoza Azuaje** | [@NathaliaValentinaCardozaAzuaje](https://github.com/NathaliaValentinaCardozaAzuaje) | Fullstack Developer |

## Project documentation

1. **[Deliverable 1 — Base Architecture & Scope](https://github.com/AndresVelez31/FinZen/wiki/Deliverable-1)**
   Team logo, verbal model, domain class diagram and architecture of the first, client-side
   version (snapshot of Deliverable 1).

2. **[Coding Style Guide (Frontend)](https://github.com/AndresVelez31/FinZen/wiki/Coding-Style-Guide-(Frontend))**
   How to use the style tools: Prettier, OXLint + ESLint, vue-tsc and Vitest (what each checks,
   config, when to run it).

3. **[Programming Rules (Frontend)](https://github.com/AndresVelez31/FinZen/wiki/Programming-Rules-(Frontend))**
   Rules by layer (views, services, stores, interfaces, DTOs, components, routing, environment),
   plus naming, TypeScript and file layout.

4. **[Deliverable 2 — Full Stack (Vue.js + Nest.js)](https://github.com/AndresVelez31/FinZen/wiki/Deliverable-2)**
   Class diagram and the general, front-end and back-end architecture diagrams.

5. **[Coding Style Guide (Backend)](https://github.com/AndresVelez31/FinZen/wiki/Coding-Style-Guide-(Backend))**
   How to use the style tools in the Nest.js project: Prettier, type-aware OXLint, the TypeScript
   build and migrations.

6. **[Programming Rules (Backend)](https://github.com/AndresVelez31/FinZen/wiki/Programming-Rules-(Backend))**
   Rules for modules, controllers, services, entities, migrations and security, plus naming and
   code style.

7. **[Architecture decisions](https://github.com/AndresVelez31/FinZen/tree/main/docs/decisions)**
   Historical and current implementation decisions. When an older decision
   references a renamed or removed element, the latest accepted decision and
   current source code describe the active design.

8. **[Main Application Features](https://github.com/AndresVelez31/FinZen/wiki/Screenshots)**
   In this page we put the screenshots of the most important sections of our project.




## Technology stack

| Area | Current implementation |
|---|---|
| UI | Vue 3.5, Composition API, `<script setup lang="ts">` |
| Build | Vite 8 and TypeScript 6 |
| Routing | Vue Router 5 with HTML5 history |
| State | Pinia 4 with Setup Stores |
| Charts | Chart.js 4 and ApexCharts 7 through `vue3-apexcharts` |
| UI feedback | SweetAlert2 and `lucide-vue-next` |
| Styling | Project CSS and Tailwind CSS Vite integration |
| Quality | vue-tsc, OXLint, ESLint, Prettier, and Vitest |
| Backend | Nest.js 12, TypeORM 1 and SQLite (`better-sqlite3`) |
| Authentication | `@nestjs/authentication` (JWT access and refresh tokens, scrypt) |
| HTTP client | axios, wrapped by `BaseService` |
| Deployment | Multi-stage Docker images (Nginx + Node) and GitHub Actions CI |

## Quick links

- Repository: [github.com/AndresVelez31/FinZen](https://github.com/AndresVelez31/FinZen)
- Issues and backlog: [GitHub Issues](https://github.com/AndresVelez31/FinZen/issues)
- Contribution workflow: [CONTRIBUTING.md](https://github.com/AndresVelez31/FinZen/blob/main/CONTRIBUTING.md)