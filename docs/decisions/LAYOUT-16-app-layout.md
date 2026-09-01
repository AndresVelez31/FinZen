# LAYOUT-16: Implement AppLayout (Responsive Sidebar, Header & Theme Toggle)

## What was done

`AppLayout.vue` already existed with the full shell (sidebar, header, mobile collapse, blank login layout) but shipped with two hardcoded stubs, explicitly marked `// Temporary stubs (replaced in Issue #4 + #8 with Pinia stores)`:

- `authenticatedUser` was a `ref` permanently set to `null`, so the header never showed a real user.
- `toggleAppTheme()` flipped a local ref but never touched the DOM or persisted anything — the theme toggle button was purely decorative.

This issue wires both up for real, and removes an unused `clearSession()` function left over from the stub.

## Decisions

### 1. `currentUser` via `UserService`
Replaced the hardcoded `ref` with `computed(() => UserService.getCurrentUser())`, the same pattern already used in `DashboardView.vue`. `isAdminUser` derives from `currentUser.value?.role === 'admin'`.

### 2. Theme state: a Pinia store, not a service or a local ref
Considered three options:
- A local `ref` in `AppLayout.vue` writing directly to `localStorage`: rejected because `AppLayout` is not mounted on the blank login layout (`App.vue` renders `<RouterView v-if="isBlank" /> <AppLayout v-else />`), so the saved preference would never apply to `/login`.
- A dedicated bootstrap module (`src/theme.ts`, mirroring `PiniaConfig.ts`) applying the class in `main.ts`: works, but duplicates state that Pinia already manages, and `main.ts` should stay a thin bootstrap file.
- **A Pinia store** (`useThemeStore`): correct fit per the project's own rule — "a value that changes during execution and multiple parts of the app need to react to it belongs in a Store." Both `AppLayout` (icon) and `App.vue` (the `dark` class on `<html>`) need to react to the same value. `PiniaConfig` already persists the *entire* Pinia state generically (not just the four domain stores), so `themestore.ts` gets `localStorage` persistence for free, with no `ThemeService` needed — the mutation (`theme = theme === 'light' ? 'dark' : 'light'`) is trivial enough to not warrant a dedicated service layer.

No `config/theme.ts` was added either: there are no theme color constants to define outside of Vue — those already live in `src/assets/style.css` as CSS custom properties (`:root` / `html.dark`).

### 3. `theme: 'light' | 'dark'`, not a boolean
A `ref<Theme>('light')` with `type Theme = 'light' | 'dark'` was chosen over `isDark: ref(false)`. Both are equally type-safe once explicitly typed (per `Coding-Style-Guide.md`'s "explicit typing of `ref`"), but the string union expresses the domain directly — "the current theme is `light` or `dark`" — and scales cleanly if a third mode (e.g. `'system'`) is ever added, whereas a boolean would force an ambiguous reinterpretation of `false`.

### 4. Where the `dark` class is applied
`App.vue` (the one component always mounted, blank layout or not) runs a `watchEffect` toggling `document.documentElement.classList` based on `themeStore.theme`. This makes the toggle "work across the app," including the login screen, without needing a separate main.ts bootstrap step — Pinia's own state hydration (synchronous, before `app.mount()`) already guarantees the correct value is present before first paint.

### 5. Removed dead code
`clearSession()` was declared but never called (`handleLogout` already called `UserService.logout()` directly) — deleted as unused/dead code.

### 6. Dark-mode bug found while testing: `.demo-btn` in `LoginView.vue`
Testing the theme toggle end-to-end (log in → toggle dark → log out) surfaced a real bug on the login screen's demo-account buttons: `.demo-btn` never set an explicit `color`. Browsers apply their own default system color (`ButtonText`) to `<button>` elements instead of inheriting the page's `color`, and without a `color-scheme` declaration that default can clash with a dark background — the unstyled `<strong>{{ account.role }}</strong>` inside rendered as dark text on a dark button. Fixed by adding `color: var(--text)` to `.demo-btn`, so its children inherit the intended theme color instead of the browser's system default.

## Validation

- `npx vue-tsc --noEmit` passes cleanly on the touched files (pre-existing errors in legacy views importing `@/store` are unrelated, out of scope for this issue).
- `npx eslint` reports no issues on `AppLayout.vue`, `App.vue`, `themestore.ts`.
- Verified no view under `src/views/` renders its own sidebar/shell markup (no duplication).
