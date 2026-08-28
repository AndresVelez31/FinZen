# Contribution Guide — FinZen

This guide defines how to collaborate on this repository to maintain a clean git history, consistent architecture, and a structured review process.

---

## Branching Strategy

The main branch is `main`. **Direct commits to `main` are prohibited.**

### Naming Convention

```
feature/<short-description>     ← new feature or capability
fix/<short-description>         ← bug fix
refactor/<short-description>    ← refactoring without functional changes
docs/<short-description>        ← documentation only
style/<short-description>       ← formatting / styling only
chore/<short-description>       ← maintenance, dependencies, tooling
```

### Examples

```
feature/login-view
feature/transactions-crud
feature/reports-charts
fix/transaction-filter-month
refactor/extract-currency-formatter
docs/update-readme
chore/setup-pinia
```

### Workflow

```
main
 │
 ├── feature/login-view          ← you work here
 ├── feature/transactions-crud   ← teammate works here
 └── fix/account-balance         ← bug fix branch
```

1. Update your local `main` and branch off:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```
2. Develop your changes locally.
3. Open a Pull Request toward `main` once completed.

---

## Commit Messages

Commits must represent **a single, coherent, and atomic change**.

### Format

```
<type>: <imperative description in English>
```

### Valid Types

| Type | Purpose |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring without feature change |
| `style` | Formatting, semicolons, spacing |
| `docs` | Documentation updates only |
| `chore` | Build tools, config, dependencies |

### Good Examples

```
feat: add transaction service with CRUD methods
feat: add transactions index view
fix: correct monthly filter in reports
refactor: extract formatToCOP to utils
docs: update contributing guide
chore: update vite to 5.4
```

### Bad Examples ❌

```
stuff
final
final2
now it works
fixes
changes
```

---

## Pre-Commit Checklist

Before staging and committing, ensure that:

- [ ] Code runs and builds without errors (`npm run build`).
- [ ] No unexplained runtime errors or console warnings.
- [ ] Layering rule `View → Service → Store` is respected.
- [ ] Files and components are placed in their proper folders.
- [ ] No duplicated domain or calculation logic.
- [ ] Identifiers and function names are clean and self-explanatory.

---

## Pull Requests

All major changes must go through a **Pull Request (PR)**.

### Author Checklist Before Opening a PR

```
[ ] Implemented functionality satisfies acceptance criteria
[ ] Layered architecture guidelines are strictly followed
[ ] No direct store access from Views (Services are used)
[ ] No duplicate business logic
[ ] Proper TypeScript types and DTOs used (no unjustified `any`)
[ ] Views handle loading, empty, and error states properly
[ ] No debug `console.log` left in production code
[ ] Documentation updated if applicable
```

### Reviewer Checklist

1. Does the feature meet the user requirements?
2. Is the code located in the correct layer (`views/`, `services/`, `stores/`, `utils/`, etc.)?
3. Does it follow `View → Service → Store`?
4. Is there any duplicated logic?
5. Are naming conventions descriptive and standard?
6. Are empty / error UI states handled?

---

## Fundamental Architectural Rule

> **A new feature must adapt to the existing architecture.
> Never alter the architecture to accommodate a quick shortcut.**

For full details, consult the [GitHub Wiki](https://github.com/AndresVelez31/FinZen/wiki).
