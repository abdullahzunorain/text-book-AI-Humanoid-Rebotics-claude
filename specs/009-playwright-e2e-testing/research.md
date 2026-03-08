# Research: Playwright E2E Testing & Mobile Auth Fix

**Feature**: 009-playwright-e2e-testing  
**Date**: 2026-03-08  
**Status**: Complete

## Research Tasks

### R1: Existing Test Infrastructure

**Question**: What test infrastructure currently exists in the frontend (website/) project?

**Finding**: None. No Playwright, Jest, Vitest, or any test runner is configured.
- `website/package.json` has no test dependencies and no test scripts
- No `*.test.ts`, `*.spec.ts`, or `e2e/` directories exist under `website/`
- Backend has 112 pytest tests in `backend/tests/` — unaffected by this feature
- DevDependencies only include `typescript ~5.6.2`

**Decision**: Install `@playwright/test` as devDependency; create `website/e2e/` directory with `playwright.config.ts`. Keep E2E tests co-located with the Docusaurus frontend.

**Rationale**: Playwright is the industry standard for cross-browser E2E testing, supports multiple viewports natively, and integrates with CI/CD. Co-locating tests in `website/e2e/` keeps them discoverable alongside the frontend code.

**Alternatives considered**:
- Cypress: Heavier, no native multi-browser, slower; rejected.
- Vitest + testing-library: Unit/integration only; doesn't cover real browser viewport testing.
- Manual testing only: Not automated; doesn't fulfill FR-015/SC-008.

---

### R2: AuthModal Keyboard Accessibility (Focus Trap, Escape, Focus-Return)

**Question**: What is the current state of keyboard accessibility in AuthModal.tsx?

**Finding**: AuthModal.tsx (193 lines) has **zero keyboard accessibility**:
- No `role="dialog"` or `aria-modal="true"` attributes
- No focus trap — Tab key moves focus outside the modal to background page elements
- No Escape key handler — only closes via × button or overlay click
- No focus-return — when modal closes, focus is lost (goes to `<body>`)
- No `aria-label` or `aria-labelledby` on the modal container

**Decision**: Implement all three a11y features in AuthModal.tsx:
1. **Focus trap**: Use a custom `useEffect` hook with `keydown` listener on the modal container. Query all focusable elements (`button, input, [tabindex]`), cycle Tab/Shift+Tab within them.
2. **Escape-to-close**: Add `keydown` listener for Escape key in the same `useEffect`.
3. **Focus-return**: Accept a `triggerRef` prop from AuthButton; on modal close, call `triggerRef.current?.focus()`.
4. **ARIA**: Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the modal title.

**Rationale**: Custom implementation avoids adding a dependency (e.g., `focus-trap-react`). The focus trap logic is ~30 lines and well-understood. This aligns with constitution §VI (No Over-Engineering) and §4 (best-effort WCAG 2.1).

**Alternatives considered**:
- `focus-trap-react` library: Adds a dependency for ~30 lines of logic; rejected per constitution §VI.
- `react-aria` / `@radix-ui/dialog`: Full component library; massive overkill for one modal.
- No focus trap (Escape only): Doesn't meet FR-014 requirement from clarified spec.

---

### R3: Network Error Handling in Auth Modal

**Question**: How does AuthModal.tsx currently handle network/server errors during sign-in?

**Finding**: In `handleSubmit`, the catch block does:
```typescript
catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}
```
This catches all errors uniformly. Issues:
- Network errors (fetch fails, CORS, timeout) may produce raw error messages like "Failed to fetch" or "Network request failed" — not user-friendly.
- Server 500 errors return JSON `{ detail: "..." }` which may contain internal details.
- No distinction between credential errors (400/401) and infrastructure errors (500/network).

**Decision**: Add a `try/catch` wrapper in `handleSubmit` that:
1. Catches fetch-level errors (TypeError from `fetch()`) → show "Something went wrong. Please check your connection and try again."
2. Catches HTTP 500+ errors → show "Something went wrong. Please try again later."
3. Preserves existing behavior for 400/401 errors → show the server's error message (e.g., "Invalid email or password").

**Rationale**: Minimal change to existing error flow. Only adds network/server distinction. Doesn't expose internal error details to users.

**Alternatives considered**:
- Retry logic with exponential backoff: Over-engineering for a modal form; rejected.
- Toast notifications instead of inline errors: Inconsistent with current UI pattern; rejected.
- No change: Doesn't meet FR-016 from clarified spec.

---

### R4: Dark Mode Modal Contrast

**Question**: Does the auth modal render correctly in dark mode?

**Finding**: `auth-modal.css` uses Docusaurus CSS variables throughout:
- Background: `var(--ifm-background-color)` (dark mode: ~#1b1b1d)
- Text: `var(--ifm-font-color-base)` (dark mode: ~#e3e3e3)
- Input background: `var(--ifm-background-surface-color)` (dark mode: ~#242526)
- Borders: `var(--ifm-color-emphasis-300)` (dark mode: ~#444950)
- Error text: `var(--ifm-color-danger)` (dark mode: red variant)
- Tab active: `var(--ifm-color-primary)` (dark mode: same #2e8555)

**Decision**: CSS variables should handle dark mode automatically. Add an E2E test that:
1. Toggles to dark mode via the theme toggle button
2. Opens auth modal
3. Verifies modal is visible and elements are not invisible (basic contrast check via computed styles or screenshot comparison)

**Rationale**: No CSS changes needed — variables already handle theming. Verification via E2E test fulfills FR-017.

**Alternatives considered**:
- Manual dark mode CSS overrides: Not needed; CSS variables already work.
- axe-core automated contrast checking: Good but overkill for this scope; can add post-MVP.

---

### R5: Regression Prevention for navbar__item

**Question**: How to prevent re-adding the `navbar__item` class to AuthButton?

**Finding**: The root cause was that `AuthButton.tsx` used `className="navbar__item button button--primary button--sm"`. Docusaurus hides `.navbar__item` at <996px. The fix removed `navbar__item`. Two prevention mechanisms are required:

**Decision**:
1. **Code comment** in AuthButton.tsx above the button JSX:
   ```tsx
   {/* WARNING: Do NOT add 'navbar__item' class — Docusaurus hides it at <996px. See spec 009. */}
   ```
2. **Automated E2E regression test** in `auth-button-mobile.spec.ts`:
   - Test at 375px, 768px viewports
   - Assert Sign In button has `display` !== `none` and is visible
   - This test fails immediately if `navbar__item` is re-added

**Rationale**: Dual protection — comment catches humans during code review; automated test catches any regression in CI. Fulfills FR-015 and SC-008.

---

### R6: Playwright Configuration for Docusaurus

**Question**: What is the best Playwright configuration for testing a Docusaurus site?

**Finding**: Best practices for Playwright + Docusaurus:
- Use `webServer` config to start `npm run serve` (serves production build) or `npm run start` (dev server)
- Configure multiple `projects` for cross-browser testing (chromium, firefox, webkit) and viewports
- Set `baseURL` to `http://localhost:3000/text-book-AI-Humanoid-Rebotics-CLAUDE/`
- Use `testDir: './e2e'` for test file location
- Set reasonable timeouts: `timeout: 30000` for tests, `expect.timeout: 5000` for assertions

**Decision**: Use `npm run serve` (production build) as the webServer for deterministic testing. Configure 3 viewport projects (mobile 375px, tablet 768px, desktop 1280px) on Chromium only for speed. Add Firefox/WebKit as optional CI-only projects.

**Rationale**: Testing against production build catches build-time issues. Three viewport sizes cover the critical breakpoints from the spec. Chromium-only for local speed; multi-browser in CI.

**Alternatives considered**:
- Dev server (`npm start`): Slower, HMR introduces flakiness; rejected for E2E.
- All browsers locally: Too slow for local development; deferred to CI.

## Summary of Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| R1 | Install `@playwright/test`, tests in `website/e2e/` | Industry standard, co-located, no existing infra |
| R2 | Custom focus trap + Escape + focus-return in AuthModal | ~30 lines, no new dependency, WCAG compliance |
| R3 | Distinguish network vs credential errors in catch block | Minimal change, user-friendly, meets FR-016 |
| R4 | E2E dark mode test only (no CSS changes needed) | CSS variables already handle theming |
| R5 | Code comment + automated E2E regression test | Dual protection: human review + CI catch |
| R6 | Playwright config: production build, 3 viewports, Chromium | Deterministic, fast, covers critical breakpoints |
