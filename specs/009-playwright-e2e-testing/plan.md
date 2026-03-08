# Implementation Plan: Playwright E2E Testing & Mobile Auth Fix

**Branch**: `009-playwright-e2e-testing` | **Date**: 2026-03-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-playwright-e2e-testing/spec.md`

## Summary

Implement comprehensive E2E testing infrastructure using Playwright, fix the mobile Sign In button visibility bug already applied, add auth modal keyboard accessibility (focus trap, Escape-to-close, focus-return), add network error handling for sign-in, verify dark mode modal contrast, add regression prevention (code comment + automated E2E test), and verify the signed-in state on mobile viewports. The mobile CSS bug fix (removing `navbar__item` from AuthButton) is already implemented and verified.

## Technical Context

**Language/Version**: TypeScript 5.6, React 19, Node.js 18+
**Primary Dependencies**: Docusaurus 3.9.2, Playwright (new — `@playwright/test`), React 19
**Storage**: N/A (frontend-only changes + E2E tests)
**Testing**: Playwright Test (`@playwright/test`) for E2E, existing pytest for backend (112 tests)
**Target Platform**: Web — all modern browsers (Chrome, Firefox, Safari), viewports 320px–1920px+
**Project Type**: Web application (Docusaurus SSG + FastAPI backend)
**Performance Goals**: Auth modal opens in <1s, page loads in <3s (constitution)
**Constraints**: Best-effort WCAG 2.1 (constitution §4), no breaking changes to existing 112 backend tests
**Scale/Scope**: 5 E2E test files covering ~22 acceptance scenarios across 5 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ PASS | E2E tests and bug fixes directly support deployment quality |
| II. No Auth scope creep | ✅ PASS | Not adding new auth features; fixing broken existing auth UX |
| III. Content Scope | ✅ PASS | No content changes |
| IV. Chatbot Omnipresence | ✅ PASS | Chatbot tested but not modified |
| V. Deployability | ✅ PASS | All changes are deployable; E2E tests verify deployment readiness |
| VI. No Over-Engineering | ✅ PASS | Minimal Playwright setup; 5 focused test files, no custom framework |
| Accessibility (§4) | ✅ PASS | Focus trap + Escape-to-close = best-effort WCAG 2.1 compliance |
| Mobile-Responsive (§5) | ✅ PASS | Core deliverable — fixing mobile auth button visibility |
| Testing & QA | ✅ PASS | Automated E2E tests fulfill constitution's end-to-end requirement |
| No Hardcoded Secrets | ✅ PASS | No secrets involved; tests use localhost URLs |

**Constitution Gate: PASS** — No violations. Feature is aligned with all principles.

## Project Structure

### Documentation (this feature)

```text
specs/009-playwright-e2e-testing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal — no data entities)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (test contracts)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
website/
├── src/
│   ├── components/
│   │   ├── AuthButton.tsx        # MODIFIED: regression comment (navbar__item warning)
│   │   └── AuthModal.tsx         # MODIFIED: focus trap, Escape-to-close, focus-return, network error handling
│   ├── css/
│   │   ├── auth-modal.css        # REVIEWED: dark mode contrast verification
│   │   └── custom.css            # ALREADY MODIFIED: cleaned up CSS override
│   └── theme/
│       └── Navbar/Content/
│           └── index.tsx          # NO CHANGES (AuthButton injection already correct)
├── e2e/                           # NEW: Playwright E2E test infrastructure
│   ├── playwright.config.ts       # Playwright configuration
│   ├── auth-button-mobile.spec.ts # US1: Sign In button visibility across viewports
│   ├── auth-modal.spec.ts         # US2: Modal functionality, a11y, keyboard, dark mode
│   ├── homepage.spec.ts           # US3: Homepage content rendering
│   ├── docs-navigation.spec.ts   # US4: Docs page navigation & features
│   └── chatbot.spec.ts           # US5: AI chatbot interaction
├── package.json                   # MODIFIED: add Playwright devDependency + test script
└── tsconfig.json                  # MAY NEED: include e2e/ in config
```

**Structure Decision**: E2E tests live in `website/e2e/` co-located with the Docusaurus frontend, following Playwright's recommended project-relative structure. One spec file per user story for clear traceability to spec acceptance scenarios.

## Complexity Tracking

> No constitution violations — this section is intentionally empty.
