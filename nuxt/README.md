# FinZen · Hybrid project (Nuxt 4)

Mini version of FinZen for Deliverable 2 (Hybrid Project). It is a Nuxt 4 project with three
sections that use different rendering strategies, configured with `routeRules` in
`nuxt.config.ts`. The styles use Bootstrap 5.3.3 (CDN) with FinZen's emerald identity.

## Sections and rendering

| Route                                               | Content                                         | Rendering          |
| --------------------------------------------------- | ----------------------------------------------- | ------------------ |
| `/blog`, `/blog/[slug]`                             | 3 articles written in the front-end code        | SSG (`prerender`)  |
| `/accounts`, `/accounts/[id]`                       | Accounts served by `GET /api/accounts[/:id]`    | SSR (`ssr: true`)  |
| `/tools`, `/tools/savings-calculator`, `/tools/faq` | Savings calculator and frequently asked questions | CSR (`ssr: false`) |

## Structure

```text
nuxt/
├── app/
│   ├── assets/css/main.css      # FinZen identity on top of Bootstrap
│   ├── data/                    # ARTICLES and FAQS (fixed data)
│   ├── enums/constants.ts       # NAV_ITEMS and SECTION_CARDS
│   ├── interfaces/              # One interface per file
│   ├── pages/                   # index, blog/, accounts/, tools/
│   ├── services/AccountService.ts  # $fetch to /api/accounts
│   ├── utils/                   # Pure utils (articles, calculator, formatting)
│   ├── app.vue                  # Navigation bar, footer and <NuxtPage />
│   └── error.vue
├── server/
│   ├── accounts/                # account.entity, accounts.data, accounts.validate, accounts.service
│   └── api/accounts/            # Route handlers (the "controllers")
├── nuxt.config.ts
├── Dockerfile
└── package.json
```

Flow: the page calls `AccountService` (View → Service → `$fetch`) and the server route handler
(controller) validates with `AccountsValidator`, queries `AccountsService`, and this one reads
`ACCOUNTS` (fixed data, no database).

## Commands

```bash
cd nuxt
npm install
npm run dev       # http://localhost:3000
npm run build
npm run preview
```

## Docker / VM

From the repository root, `docker compose up -d --build nuxt` publishes the application at
`http://<IP>:3001`. The GCP firewall must allow `tcp:3001`.
