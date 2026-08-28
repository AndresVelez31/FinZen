# INFRA-03: ESLint, OXLint and Prettier

## Estado

Aceptada para la configuración de calidad. `lint` y `format` están implementados y
funcionan. `type-check` y `build` quedan diferidos a los issues `#4-#8`, donde se
implementarán los stores, contratos e imports definitivos.

## Contexto

El proyecto necesita una herramienta de formato y un pipeline dual de linting para
mantener consistencia de código, detectar errores y aplicar las reglas definidas en
`docs/wiki/Programming-Rules.md` y `docs/wiki/Coding-Style-Guide.md`.

El issue #3 establece que OXLint debe ejecutarse primero y ESLint después, además de
incluir scripts para formato, comprobación de tipos y build.

## Decisiones

- Se utiliza Prettier con `semi: true`, `singleQuote: true`, `printWidth: 100`,
  `trailingComma: 'all'` y `tabWidth: 2`.
- Se utiliza OXLint como primer linter mediante `npm run lint:oxlint`.
- Se utiliza ESLint 10 con configuración flat en `eslint.config.ts` como segundo
  linter mediante `npm run lint:eslint`.
- Se utiliza `eslint-plugin-vue` para las reglas de Vue 3, la configuración recomendada
  de TypeScript de Vue y `eslint-plugin-oxlint` para evitar duplicar reglas cubiertas
  por OXLint.
- Los globals del navegador utilizados por la aplicación se declaran explícitamente
  en ESLint.
- El caché generado por ESLint se excluye del control de versiones mediante
  `frontend/.eslintcache` en `.gitignore`.
- Los bloques `<script setup>` de los SFC se declaran con `lang="ts"`, conforme a la
  arquitectura TypeScript del proyecto.
- No se acepta `@ts-nocheck` como solución permanente, porque oculta errores y
  contradice las reglas de TypeScript estricto y ESLint.

## Razones

- OXLint ofrece una validación rápida de reglas generales y ESLint conserva las reglas
  específicas de Vue y TypeScript.
- Ejecutar OXLint antes que ESLint respeta el pipeline definido por el issue y evita
  que ambas herramientas compitan por las mismas reglas.
- La configuración flat es el formato requerido por ESLint 10.
- Mantener Prettier separado del linting conserva una responsabilidad clara: Prettier
  formatea y los linters detectan problemas de calidad.
- Ignorar el caché evita incluir archivos generados en commits y pull requests.

## Alternativas consideradas

- Usar únicamente ESLint: descartado porque el issue exige un pipeline dual con OXLint.
- Desactivar `vue/block-lang` para conservar scripts JavaScript: descartado porque
  contradice la regla del proyecto de utilizar `<script setup lang="ts">`.
- Añadir `@ts-nocheck` a los SFC: descartado como solución de calidad porque evita que
  TypeScript informe errores y hace fallar la regla `@typescript-eslint/ban-ts-comment`.
- Instalar una dependencia adicional para globals del navegador: descartado porque
  los globals necesarios son pocos y pueden declararse explícitamente en la
  configuración local.

## Scripts implementados

| Script | Comando | Responsabilidad |
|---|---|---|
| `lint` | `run-s "lint:*"` | Ejecuta OXLint y luego ESLint |
| `lint:oxlint` | `oxlint . --fix` | Linting rápido |
| `lint:eslint` | `eslint . --fix --cache` | Reglas Vue y TypeScript |
| `format` | `prettier --write --experimental-cli src/` | Formato del código fuente |
| `type-check` | `vue-tsc --build` | Comprobación de tipos |
| `build` | `run-p type-check "build-only {@}" --` | Type-check y build en paralelo |

## Consecuencias

- `npm run lint` y `npm run format` quedan disponibles para todos los desarrolladores
  desde esta fase de infraestructura.
- Los SFC no utilizan `@ts-nocheck`; los errores de tipos no se ocultan para forzar un
  resultado verde.
- `npm run type-check` y `npm run build` permanecen pendientes porque las vistas aún
  dependen de `src/store` y de imports anteriores a la reorganización de carpetas.
- Los issues `#4-#8` deben completar Pinia, interfaces, DTOs, seeders y stores; después
  se deben ejecutar nuevamente todas las validaciones.
- El PR debe explicar este alcance y no presentar `type-check` o `build` como
  satisfactoriamente aprobados en esta fase.

## Validación

- `npm run lint`: correcto.
- `npm run format`: correcto.
- `npm run type-check`: pendiente por contratos, stores e imports de issues posteriores.
- `npm run build`: pendiente por los mismos errores de `type-check`.

## Fecha

2026-08-28
