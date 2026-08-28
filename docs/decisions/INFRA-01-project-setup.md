# INFRA-01: Project Setup — Vite 8 + Vue 3 + TypeScript + TailwindCSS 4

## What was done

Migrated the frontend project from a plain JavaScript/Vite 5 scaffold to a fully typed
TypeScript setup using the exact versions required by the course architecture guide.

## Files created / modified

| File | Action | Reason |
|---|---|---|
| `vite.config.ts` | Created (replaced `vite.config.js`) | TypeScript config files are type-checked too |
| `tsconfig.json` | Created | Root references config — unifies app and node sub-projects |
| `tsconfig.app.json` | Created | TypeScript rules for `src/` (strict mode) |
| `tsconfig.node.json` | Created | TypeScript rules for `vite.config.ts` (Node environment) |
| `src/main.ts` | Created (replaced `main.js`) | Entry point must be TypeScript |
| `src/App.vue` | Updated | Added `lang="ts"` to `<script setup>` |
| `index.html` | Updated | Entry point changed from `main.js` → `main.ts` |
| `package.json` | Updated | Version upgrades + new deps + scripts |

---

## Dependency decisions

### Why Vite 8?
The course tutorials use Vite 8 (`^8.1.5`). Vite 8 brings faster cold starts and a
new environment API that better separates client and server code.

### Why `@tailwindcss/vite` instead of PostCSS?
TailwindCSS 4 changed its integration model. Instead of a PostCSS plugin, it is now
installed as a **Vite plugin** directly. This simplifies the config (no `postcss.config.js`
needed) and gives Tailwind direct access to Vite's module graph for faster builds.

### Why `vite-plugin-vue-devtools@^8.1.5`?
v7 of this plugin only supports up to Vite 7. v8 was released alongside Vite 8 and is
fully compatible. It injects a DevTools panel directly into the browser during development.

### Why three `tsconfig` files?
| File | Covers | Why separate |
|---|---|---|
| `tsconfig.json` | Nothing (references only) | VS Code and `vue-tsc` need a root config to discover all sub-projects |
| `tsconfig.app.json` | `src/**` | Application code runs in the browser — uses DOM lib, Vite types |
| `tsconfig.node.json` | `vite.config.ts` | Config files run in Node — no DOM, uses NodeNext module resolution |

### Why `@vue/tsconfig/tsconfig.dom.json` as base?
The Vue team maintains this config specifically for Vue 3 + Composition API projects.
It pre-configures `module: Bundler`, `moduleResolution: Bundler`, `lib: DOM`, and
enables `jsx: preserve` for Vue templates. Extending it avoids duplicating boilerplate.

### Why `@tsconfig/node24` for node config?
Sets up the correct `module: NodeNext` / `moduleResolution: NodeNext` for Node 24 LTS.
We do **not** override `moduleResolution` here because it would conflict with the base.

---

## TypeScript strict settings (tsconfig.app.json)

| Option | What it enforces | Example |
|---|---|---|
| `strict: true` | Enables all strict checks (noImplicitAny, strictNullChecks, etc.) | Variables must have explicit types |
| `noUncheckedIndexedAccess` | Array access returns `T \| undefined` | Must null-check before using `arr[0]` |
| `exactOptionalPropertyTypes` | `{ x?: string }` cannot be set to `undefined` explicitly | Prevents subtle optional prop bugs |
| `verbatimModuleSyntax` | Type-only imports must use `import type` | `import type { UserInterface } from ...` |
| `isolatedModules` | Each file must compile independently | No cross-file const enums |

---

## npm scripts

| Script | Command | Why |
|---|---|---|
| `dev` | `vite` | Starts the dev server with HMR at localhost:5173 |
| `build` | `run-p type-check "build-only"` | Runs type-check AND build **in parallel** (faster) |
| `build-only` | `vite build` | Bundles the app for production |
| `type-check` | `vue-tsc --build` | Checks types incrementally (only changed files) |
| `lint` | `run-s "lint:*"` | Runs OXLint **then** ESLint in sequence |
| `lint:oxlint` | `oxlint . --fix` | Fast linter (written in Rust) — catches common errors |
| `lint:eslint` | `eslint . --fix --cache` | Rule-based linter for Vue/TS-specific rules |
| `format` | `prettier --write --experimental-cli src/` | Auto-formats all source files |

`run-p` and `run-s` come from `npm-run-all2` and allow parallel/sequential script execution.

---

## Decisions NOT made in this issue (deferred)

- **`App.vue` is minimal** (`<RouterView />` only) — the full layout with `AppLayout`
  and route transition will be restored in **Issue #2** once `AppLayout.vue` exists.
- **No router configuration** — routes will be defined in **Issue #15**.
- **No Pinia** — `PiniaConfig.ts` with the static class pattern is **Issue #4**.
- **No ESLint/OXLint config files** — `.oxlintrc.json` and `eslint.config.ts` are **Issue #3**.
