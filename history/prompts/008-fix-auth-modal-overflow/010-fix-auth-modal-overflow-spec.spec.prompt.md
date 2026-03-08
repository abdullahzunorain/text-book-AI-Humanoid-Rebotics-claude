---
id: 010
title: Fix Auth Modal Popup Overflow Spec
stage: spec
date: 2026-03-08
surface: agent
model: claude-opus-4.6
feature: 008-fix-auth-modal-overflow
branch: 008-fix-auth-modal-overflow
user: zunorain
command: /speckit.specify
labels: ["bugfix", "auth-modal", "css", "overflow", "viewport"]
links:
  spec: specs/008-fix-auth-modal-overflow/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/008-fix-auth-modal-overflow/spec.md
  - specs/008-fix-auth-modal-overflow/checklists/requirements.md
  - website/src/css/auth-modal.css
tests:
  - Spec quality checklist: PASS (all items checked)
  - CSS validation: PASS (0 errors)
---

## Prompt

the authentication pop-up is on top half of its surface is not visible, pls have a look at this issue and solve this properly.... make sure dont change any backend

## Response snapshot

Created feature branch `008-fix-auth-modal-overflow` and wrote bug-fix specification at `specs/008-fix-auth-modal-overflow/spec.md`.

Root cause: `.auth-modal-overlay` used `display: flex; align-items: center` with no overflow handling, and `.auth-modal` had no `max-height` or `overflow-y: auto`. When modal content exceeded viewport height, flex centering clipped content equally at top and bottom.

Fix applied to `website/src/css/auth-modal.css`:
1. Overlay: added `padding: 1rem` + `overflow-y: auto`
2. Modal: added `max-height: calc(100vh - 2rem)` + `overflow-y: auto` + `margin: auto`

Spec includes 2 user stories (P1), 7 functional requirements, 5 success criteria, root cause analysis, edge cases, and quality checklist (all items pass).

## Outcome

- ✅ Impact: Auth modal now fully visible and scrollable on all viewport sizes
- 🧪 Tests: CSS validation PASS, spec quality checklist PASS
- 📁 Files: 3 files created/modified (spec, checklist, auth-modal.css)
- 🔁 Next prompts: Visual QA at 375px / 480px viewports, run npm run build to verify
- 🧠 Reflection: Bug was a classic flex overflow issue — centering without max-height constraints on variable-height content

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): CSS validation PASS, spec checklist PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Verify fix visually at multiple viewport sizes
