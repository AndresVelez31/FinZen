# FinZen · Proyecto híbrido (Nuxt 4)

Mini versión de FinZen para el Entregable 2 (Proyecto Híbrido). Es un proyecto Nuxt 4 con tres
secciones que usan estrategias de renderizado distintas, configuradas con `routeRules` en
`nuxt.config.ts`. Los estilos usan Bootstrap 5.3.3 (CDN) con la identidad esmeralda de FinZen.

## Secciones y renderizado

| Ruta                                          | Contenido                                       | Renderizado        |
| --------------------------------------------- | ----------------------------------------------- | ------------------ |
| `/blog`, `/blog/[slug]`                       | 3 artículos escritos en el código del front end | SSG (`prerender`)  |
| `/accounts`, `/accounts/[id]`                 | Cuentas servidas por `GET /api/accounts[/:id]`  | SSR (`ssr: true`)  |
| `/tools`, `/tools/savings-calculator`, `/tools/faq` | Calculadora de ahorro y preguntas frecuentes | CSR (`ssr: false`) |

## Estructura

```text
nuxt/
├── app/
│   ├── assets/css/main.css      # Identidad FinZen sobre Bootstrap
│   ├── data/                    # ARTICLES y FAQS (datos fijos)
│   ├── enums/constants.ts       # NAV_ITEMS y SECTION_CARDS
│   ├── interfaces/              # Una interfaz por archivo
│   ├── layouts/default.vue      # Barra de navegación y pie
│   ├── pages/                   # index, blog/, accounts/, tools/
│   ├── services/AccountService.ts  # $fetch hacia /api/accounts
│   ├── utils/                   # Utils puros (artículos, calculadora, formato)
│   ├── app.vue
│   └── error.vue
├── server/
│   ├── accounts/                # account.entity, accounts.data, accounts.validate, accounts.service
│   └── api/accounts/            # Route handlers (los "controllers")
├── nuxt.config.ts
├── Dockerfile
└── package.json
```

Flujo: la página llama a `AccountService` (View → Service → `$fetch`) y el route handler del
servidor (controller) valida con `AccountsValidator`, consulta `AccountsService` y este lee
`ACCOUNTS` (datos fijos, sin base de datos).

## Comandos

```bash
cd nuxt
npm install
npm run dev       # http://localhost:3000
npm run build
npm run preview
```

## Docker / VM

Desde la raíz del repositorio, `docker compose up -d --build nuxt` publica la aplicación en
`http://<IP>:3001`. El firewall de GCP debe permitir `tcp:3001`.
