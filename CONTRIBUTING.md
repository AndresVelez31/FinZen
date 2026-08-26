# Guía de Contribución — FinZen

Esta guía define cómo trabajar colaborativamente en el repositorio para mantener
un historial limpio, una arquitectura consistente y un proceso de revisión ordenado.

---

## Ramas

La rama principal es `main`. **No se desarrolla directamente sobre `main`.**

### Convención de nombres

```
feature/<descripcion-corta>     ← nueva funcionalidad
fix/<descripcion-corta>         ← corrección de bug
refactor/<descripcion-corta>    ← refactorización sin cambio funcional
docs/<descripcion-corta>        ← solo documentación
style/<descripcion-corta>       ← solo cambios de formato/estilos
```

### Ejemplos

```
feature/login-view
feature/transactions-crud
feature/reports-charts
fix/transaction-filter-month
refactor/extract-currency-formatter
docs/update-readme
```

### Flujo de trabajo

```
main
 │
 ├── feature/login-view          ← trabajas aquí
 ├── feature/transactions-crud   ← otro integrante trabaja aquí
 └── fix/account-balance         ← corrección
```

1. Crea tu rama desde `main` actualizado:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nombre-de-tu-feature
   ```

2. Trabaja en tu rama.
3. Abre un Pull Request hacia `main` cuando termines.

---

## Commits

Los commits deben representar **un cambio coherente y atómico**.

### Formato

```
<tipo>: <descripción en imperativo, en español o inglés>
```

### Tipos válidos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Refactorización sin cambio funcional |
| `style` | Formato, espacios, punto y coma (sin cambio de lógica) |
| `docs` | Solo documentación |
| `chore` | Tareas de mantenimiento (dependencias, config) |

### Ejemplos correctos

```
feat: add transaction service with CRUD methods
feat: add transactions index view
fix: correct monthly filter in reports
refactor: extract formatToCOP to utils
docs: update contributing guide
chore: update vite to 5.4
```

### Ejemplos incorrectos ❌

```
cosas
final
final2
ahora si funciona
arreglos varios
cambios
```

---

## Antes de hacer commit

Verifica que:

- [ ] El código **funciona** en el navegador.
- [ ] No hay **errores de consola** evidentes.
- [ ] Respetaste el flujo `View → Service → Store` (cuando aplique).
- [ ] Los componentes están en la carpeta correcta.
- [ ] No duplicaste lógica que ya existe.
- [ ] El código es legible y los nombres son descriptivos.

---

## Pull Requests

Todo cambio importante hacia `main` debe pasar por un **Pull Request (PR)**.

### Checklist del autor antes de abrir el PR

```
[ ] La funcionalidad implementada funciona correctamente
[ ] Se respetó la arquitectura por capas definida en la guía
[ ] No se accede directamente al store desde las Views (usar Services)
[ ] No se duplicó lógica de negocio
[ ] Los nombres de archivos, variables y funciones son claros y descriptivos
[ ] Se manejan estados vacíos/error/loading en las Views que trabajan con datos
[ ] No quedan console.log de depuración en el código
[ ] Se actualizó la documentación si fue necesario
```

### Descripción del PR

Al abrir el PR, incluye:

1. **¿Qué hace este cambio?** — descripción breve.
2. **¿Cómo se probó?** — pasos para verificar que funciona.
3. **Capturas de pantalla** — si hay cambios visuales.

---

## Revisión de código

El revisor debe verificar (en este orden):

1. ¿La funcionalidad cumple el requisito?
2. ¿Está ubicada en la capa correcta? (`views/`, `services/`, `store/`, `utils/`, etc.)
3. ¿Respeta el flujo `View → Store`?
4. ¿Existe duplicación?
5. ¿Los nombres son claros e intencionales?
6. ¿Se manejan los estados vacío/error?

---

## Regla de arquitectura

> **Una funcionalidad nueva debe adaptarse a la arquitectura existente.
> No se debe modificar la arquitectura para acomodar una implementación rápida.**

Ante cualquier duda arquitectónica, revisar:
- [`GUIA_ARQUITECTURA_CODIGO_LIMPIO_METODOLOGIA.md`](./frontend/GUIA_ARQUITECTURA_CODIGO_LIMPIO_METODOLOGIA.md)
