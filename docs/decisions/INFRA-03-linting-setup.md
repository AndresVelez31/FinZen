# INFRA-03: ESLint, OXLint and Prettier

## Estado

En progreso. La configuración de calidad está implementada, pero el issue no puede
cerrarse hasta resolver los errores heredados de `type-check` y `build`.

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

- Los comandos `npm run lint` y `npm run format` funcionan correctamente.
- ESLint detecta que los SFC deben utilizar TypeScript y que los globals del navegador
  deben estar declarados.
- `npm run type-check` y `npm run build` continúan bloqueados por código heredado de
  issues anteriores: faltan `src/store` y varios imports apuntan a componentes que
  fueron reorganizados en subcarpetas. Resolver esos errores corresponde a la
  implementación de stores y a la actualización de imports, no a esta configuración.
- El PR debe incluir este documento, el resultado de las validaciones y una nota sobre
  el bloqueo pendiente; no debe marcar el issue como completamente resuelto mientras
  fallen `type-check` o `build`.

## Validación

- `npm run lint`: correcto.
- `npm run format`: correcto.
- `npm run type-check`: bloqueado por errores estructurales heredados.
- `npm run build`: bloqueado por los mismos errores de `type-check`.

## Fecha

2026-08-28
