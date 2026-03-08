# Quickstart: Playwright E2E Testing & Mobile Auth Fix

**Feature**: 009-playwright-e2e-testing

## Prerequisites

- Node.js 18+ installed
- `website/` dependencies installed (`cd website && npm install`)
- Production build available (`cd website && npm run build`)

## Setup Playwright

```bash
cd website

# Install Playwright as dev dependency
npm install -D @playwright/test

# Install browser binaries (Chromium only for local dev)
npx playwright install chromium
```

## Run E2E Tests

```bash
cd website

# Build first (tests run against production build)
npm run build

# Run all E2E tests
npx playwright test

# Run a specific test file
npx playwright test e2e/auth-button-mobile.spec.ts

# Run with UI mode (interactive debugging)
npx playwright test --ui

# Run with headed browser (see the browser)
npx playwright test --headed
```

## Run Backend Tests (Verify No Regressions)

```bash
cd backend
source .venv/bin/activate  # or: .venv/bin/python -m pytest
python -m pytest tests/ -v
# Expected: 112 tests pass
```

## Development Workflow

1. **Make component changes** (AuthModal.tsx, AuthButton.tsx)
2. **Build**: `cd website && npm run build`
3. **Run E2E tests**: `npx playwright test`
4. **Run backend tests**: `cd backend && .venv/bin/python -m pytest tests/ -v`
5. **Verify**: All E2E tests green + 112 backend tests pass

## Key Files

| File | Purpose |
|------|---------|
| `website/e2e/playwright.config.ts` | Playwright configuration (viewports, webServer) |
| `website/e2e/auth-button-mobile.spec.ts` | Mobile Sign In button visibility tests |
| `website/e2e/auth-modal.spec.ts` | Auth modal functionality + a11y tests |
| `website/e2e/homepage.spec.ts` | Homepage content rendering tests |
| `website/e2e/docs-navigation.spec.ts` | Docs page navigation tests |
| `website/e2e/chatbot.spec.ts` | AI chatbot interaction tests |
| `website/src/components/AuthModal.tsx` | Modified: focus trap, Escape, focus-return, network errors |
| `website/src/components/AuthButton.tsx` | Modified: regression comment, triggerRef |
