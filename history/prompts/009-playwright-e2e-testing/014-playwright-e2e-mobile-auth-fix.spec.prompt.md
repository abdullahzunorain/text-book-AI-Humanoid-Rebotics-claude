---
id: 014
title: Playwright E2E Testing & Mobile Auth Fix
stage: spec
date: 2026-03-08
surface: agent
model: Claude Opus 4.6
feature: 009-playwright-e2e-testing
branch: 009-playwright-e2e-testing
user: abdullahzunorain
command: /speckit.specify
labels: ["e2e-testing", "playwright", "mobile-fix", "auth-button", "css-bug"]
links:
  spec: specs/009-playwright-e2e-testing/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - website/src/components/AuthButton.tsx
  - website/src/css/custom.css
  - specs/009-playwright-e2e-testing/spec.md
  - specs/009-playwright-e2e-testing/checklists/requirements.md
tests:
  - Playwright E2E: Homepage sections render (Hero, Features, How It Works, Stats, Footer)
  - Playwright E2E: Auth modal opens/closes at desktop (1280x800)
  - Playwright E2E: Auth modal Sign In/Sign Up tab switching
  - Playwright E2E: Password show/hide toggle
  - Playwright E2E: Overlay click-to-close
  - Playwright E2E: Form validation (empty fields, wrong credentials)
  - Playwright E2E: Docs page navigation (sidebar, breadcrumbs, next/prev)
  - Playwright E2E: Dark mode toggle
  - Playwright E2E: AI chatbot open/close
  - Playwright E2E: Sign In button visible at 375px (mobile)
  - Playwright E2E: Sign In button visible at 768px (tablet)
  - Playwright E2E: Sign In button visible at 1280px (desktop)
  - Playwright E2E: Auth modal opens at 375px mobile viewport
  - Backend pytest: 112/112 tests passed
  - Production build: SUCCESS (no errors)
---

## Prompt

pls use the playwright mcp server skills in #.claude directory and test the application properly and test that each and everything properly working ??? also check the sign in and sign up pop up window which seems incorrect and to be resolve that issue... for that properly use the playwright mcp server skills in .claude directory and in this codebase and test the application completely using mom-headless browser....

## Response snapshot

Comprehensive E2E testing performed using Playwright MCP server (port 8808) against the Docusaurus dev server (port 3000). Tested homepage rendering, auth modal at multiple viewports, docs page navigation, dark mode, chatbot, and form validation. Discovered critical bug: Sign In button completely hidden on viewports < 996px due to Docusaurus CSS `@media (max-width: 996px) { .navbar__item { display: none } }` applied to the AuthButton's `navbar__item` class. Fixed by removing `navbar__item` from AuthButton.tsx (3 elements). Verified fix at 375px, 768px, and 1280px. Production build SUCCESS, 112/112 backend tests passed.

## Outcome

- ✅ Impact: Critical mobile auth accessibility bug found and fixed — Sign In button now visible at all viewports
- 🧪 Tests: 15 E2E scenarios tested with Playwright MCP, 112 backend tests passing, production build clean
- 📁 Files: 2 modified (AuthButton.tsx, custom.css), 2 created (spec.md, requirements.md checklist)
- 🔁 Next prompts: /speckit.plan or /speckit.clarify for 009-playwright-e2e-testing
- 🧠 Reflection: Docusaurus navbar__item class should not be used on custom-injected components — it carries responsive hiding behavior. The Playwright MCP workflow is powerful for discovering CSS/responsive bugs that unit tests miss.

## Evaluation notes (flywheel)

- Failure modes observed: CSS hot-reload did not apply custom.css changes in Docusaurus dev server; required component-level fix instead of CSS-only override
- Graders run and results (PASS/FAIL): Build PASS, Backend tests PASS, Playwright visual PASS at 375px/768px/1280px
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider creating an automated Playwright test suite that runs these E2E scenarios in CI
