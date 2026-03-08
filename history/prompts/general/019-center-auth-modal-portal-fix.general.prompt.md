---
id: 019
title: Center Auth Modal with React Portal Fix
stage: general
date: 2026-03-08
surface: agent
model: claude-opus-4-6
feature: none
branch: 009-playwright-e2e-testing
user: zunorain
command: /speckit.implement
labels: ["auth-modal", "react-portal", "css", "ux-fix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - website/src/components/AuthModal.tsx
  - website/src/components/BackgroundQuestionnaire.tsx
  - website/src/css/auth-modal.css
tests:
  - website/e2e/auth-modal.spec.ts (79 passed, 0 failed)
---

## Prompt

pls make the authentication(sign in and sign up) pop up window to the center like the professional applications (eg like facebook), when some click on sign in a proper pop up window opens properly like opens in facebook at the middle of the page and dont make it invisible... must be visible properly

## Response snapshot

Root cause: Both AuthModal and BackgroundQuestionnaire were rendered inside the Docusaurus navbar DOM tree. The navbar applies CSS transforms and stacking context properties that prevent `position: fixed` from working relative to the viewport — causing the modal to be clipped, mispositioned, or invisible.

Fix applied:
1. **React Portal** (`createPortal`) added to both AuthModal.tsx and BackgroundQuestionnaire.tsx — renders modals directly into `document.body`, bypassing navbar stacking context
2. **CSS hardened**: overlay uses explicit `top/left/right/bottom: 0` + `width: 100vw; height: 100vh` instead of `inset: 0`; z-index raised to 99999/100000; `backdrop-filter: blur(4px)` added for professional appearance; stronger box-shadow on modal card

## Outcome

- ✅ Impact: Auth modal now renders centered on screen like Facebook/professional apps, fully visible on all viewports
- 🧪 Tests: 79 E2E tests passed (0 failed), TypeScript compilation clean, production build SUCCESS
- 📁 Files: 3 files modified (AuthModal.tsx, BackgroundQuestionnaire.tsx, auth-modal.css)
- 🔁 Next prompts: none
- 🧠 Reflection: When rendering modals inside component trees with CSS transforms (Docusaurus navbar), always use React Portal to escape stacking context

## Evaluation notes (flywheel)

- Failure modes observed: position:fixed inside transformed parent gets scoped to parent instead of viewport
- Graders run and results (PASS/FAIL): TSC PASS, build PASS, E2E 79/79 PASS
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
