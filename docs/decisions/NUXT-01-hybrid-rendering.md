# NUXT-01: Hybrid rendering project (Nuxt 4)

## Status

Accepted

## Context

- Deliverable 2 (hybrid project) asks for a Nuxt project where each section uses a different
  rendering strategy: a blog with hardcoded articles (SSG), the `Account` class served by the
  server layer (SSR) and a set of tools (CSR).
- The team already follows View → Service → fetch in Vue and Controller → Service → data with a
  validator in Nest, and the new project should look familiar to classmates.

## Decision

- **Rendering per section** through `routeRules` in `nuxt.config.ts`: `/blog` and `/blog/**` use
  `prerender: true`, `/accounts` and `/accounts/**` use `ssr: true` and `/tools` and `/tools/**`
  use `ssr: false`. The article pages are also listed in `nitro.prerender.routes`, built from the
  `ARTICLES` slugs, so they are generated even without a crawled link.
- **Server layer shaped like Nest.** `server/api/accounts/*.get.ts` are the route handlers (the
  controllers); `AccountsValidator.parseId` validates the `:id` param (400), `AccountsService`
  reads the hardcoded `ACCOUNTS` and answers 404 when the account does not exist, and
  `Account` is the entity. There is no database, so the entity uses `!` definite assignment.
- **Front end shaped like the Vue project.** Pages call `AccountService` (static methods, `PATH`
  constant), pure utils (`ArticleUtil`, `SavingsCalculatorUtil`, `FormattersUtil`) hold the logic
  and every interface lives in its own file. Detail pages use `definePageMeta({ validate })` as in
  Tutorial 09: the blog validates that the slug exists and the account page only that the id is a
  positive integer, since the accounts live on the server.
- **`useAsyncData` instead of `onMounted`.** This is a deliberate exception to the Vue rule
  "load data only in `onMounted`": `onMounted` never runs on the server, so the SSR page would
  render empty. `useAsyncData` fetches during the server render and transfers the result to the
  client, so it is not requested twice.
- **No Pinia or axios.** There is no shared state and Nuxt's global `$fetch` already resolves the
  base URL (and calls the route handler directly during SSR) and throws on error statuses, so
  `AccountService` has no `BaseService`. `$fetch` is not imported from `ofetch`, because the plain
  package does not resolve server routes during SSR.
- **Styling.** Bootstrap 5.3.3 from the CDN (as in the course tutorial) with a small
  `main.css` that overrides the Bootstrap variables with FinZen's emerald palette, Manrope headings
  and Inter body text.

## Consequences

- Each section can be explained with one strategy and verified in the build output
  (`.output/public/blog/<slug>/index.html` exist; `/tools/**` serves only the shell).
- The accounts are static and shared by every visitor; a real data source would replace
  `accounts.data.ts` only inside `AccountsService`.
- An id with a wrong shape (`/accounts/abc`) is rejected by the page `validate`; an unknown id
  (`/accounts/999`) passes it, so the page rethrows the API's 404 with `createError` and
  `error.vue` renders it with a real 404 status.
- The Bootstrap CDN needs internet access in the browser.
