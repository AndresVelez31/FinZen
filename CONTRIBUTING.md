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

- [ ] The "Before every commit" commands of the [Coding Style Guide (Frontend)](https://github.com/AndresVelez31/FinZen/wiki/Coding-Style-Guide-(Frontend)) (`format`, `lint`, `type-check`, `test:unit`) and of the [Coding Style Guide (Backend)](https://github.com/AndresVelez31/FinZen/wiki/Coding-Style-Guide-(Backend)) (`format`, `lint`, `build`) pass in every project you touched.
- [ ] No unexplained runtime errors or console warnings.
- [ ] Layering is respected: `View → Service → BaseService → API` in the frontend (views never read stores) and `Controller → Service → Repository` in the backend.
- [ ] Files and components are placed in their proper folders.
- [ ] No duplicated domain or calculation logic.
- [ ] Identifiers and function names are clean and self-explanatory.

---

## Pull Requests

All major changes must go through a **Pull Request (PR)**.

### PR Title Format

PR titles follow the same format as commit messages:

```
<type>(<scope>): <imperative description in English>
```

The title must **summarize the entire PR**, not copy a single commit — if the PR has several commits, the title describes the change as a whole, the same way a squash-merge message would. `<scope>` is the issue code in lowercase when there is one (e.g. `service-41`, `utils-13`); omit it if the change doesn't map to a single issue.

This matters beyond style: this repo only allows **squash merges**. Each PR lands on `main` as a single commit whose title is the PR title and whose body is the PR description, so a vague or copy-pasted title becomes permanent, hard-to-read history on `main`. `main` is protected: changes only enter through a PR, the CI checks (`build-test`, `backend`, `docker`) must pass, the branch must be up to date with `main`, and every review conversation must be resolved. No approval is required, and the branch is not deleted automatically after the merge.

```
feat(service-41): implement ReportService with strict domain model
docs(utils-13): add ADR for formatter utilities
fix(reports-24): correct monthly filter off-by-one
```

Do not use `[CODE-NN] Issue Title` as the PR title — that duplicates the linked issue instead of describing the change, and doesn't carry a `type`. (Earlier PRs in this repo used that style before this rule was written; it isn't being retroactively changed.)

### Author Checklist Before Opening a PR

```
[ ] Implemented functionality satisfies acceptance criteria
[ ] Layered architecture guidelines are strictly followed
[ ] No direct store access from Views (Services are used)
[ ] No duplicate business logic
[ ] Proper TypeScript types and DTOs used (no unjustified `any`)
[ ] Views handle empty and error states properly (and loading, only for real async data)
[ ] No debug `console.log` left in production code
[ ] Documentation updated if applicable
```

### Reviewer Checklist

1. Does the feature meet the user requirements?
2. Is the code located in the correct layer (`views/`, `services/`, `stores/`, `utils/`, etc.)?
3. Does it follow `View → Service → BaseService → API` (frontend) and `Controller → Service → Repository` (backend)?
4. Is there any duplicated logic?
5. Are naming conventions descriptive and standard?
6. Are empty / error UI states handled?

---

## Issue and Pull Request Templates

Every issue and Pull Request uses the templates in `.github/`, so they all have the same structure:

- **Issues:** choose *Feature / task* or *Bug* when creating one (blank issues are disabled). Fill the description, the acceptance criteria, the area and the size, and after creating it put its number in the title: `[CODE-NN] ...`.
- **Pull Requests:** the description starts with `Closes #` and the sections *Summary*, *What changed*, *How this was validated* and *Notes* (optional). Write the issue number after `Closes #` so it closes on merge; the acceptance criteria stay in the issue.

---

## Fundamental Architectural Rule

> **A new feature must adapt to the existing architecture.
> Never alter the architecture to accommodate a quick shortcut.**

For full details, consult the [GitHub Wiki](https://github.com/AndresVelez31/FinZen/wiki).
