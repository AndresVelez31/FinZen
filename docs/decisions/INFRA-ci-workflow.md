# INFRA: CI workflow with GitHub Actions

## Status

Accepted — extends the initial CI workflow (`.github/workflows/ci.yml`, commit `873ed5d`).

## Context

The initial `ci.yml` already installed dependencies, ran `npm run lint`, the Vitest tests in
`frontend/tests/`, and `npm run build`. Two gaps remained:

- `npm run lint` uses `--fix`, so CI silently rewrote fixable problems in the runner and passed,
  even though those fixes were never committed.
- Nothing checked that the production `Dockerfile` and `nginx.conf` still produce a working image.

## Decision

- **Lint in CI:** new `npm run check:lint` script (`oxlint . && eslint .`) without `--fix`. It is
  named `check:lint` and not `lint:*` so `npm run lint` (`run-s "lint:*"`) does not pick it up.
- **Tests:** kept in `frontend/tests/` with the existing `vitest.config.ts`. Added
  `dateRange.spec.ts`, `authService.spec.ts` and `accountService.spec.ts` (ownership, validation,
  balances, cascading delete, using a fresh Pinia instance per test) and a `formatDate` case in
  `formatters.spec.ts`.
- **Workflow** `.github/workflows/ci.yml`, triggered on PRs to `main` and manually
  (no `push` trigger, so each change runs CI once instead of again after merging):
  1. `build-test`: `npm ci` → `check:lint` → `test:unit` → `build`, then packages `dist/`,
     `Dockerfile` and `nginx.conf` into a release artifact.
  2. `docker`: builds the Nginx image from that artifact, runs it and checks that `/` and a client
     route (`/transactions`) answer (SPA fallback).

## Consequences

- Lint errors, failing tests, type errors or a broken Nginx image fail the workflow on every PR.
- Deployment stays manual, following the GCP tutorial; the CI artifact contains exactly the files
  the VM needs (`dist/`, `Dockerfile`, `nginx.conf`).
