---
id: 033
title: UI Redesign Architecture Plan
stage: plan
date: 2026-03-07
surface: agent
model: Claude Sonnet 4.6
feature: 006-ui-redesign
branch: 006-ui-redesign
user: abdullahzunorain
command: /speckit.plan
labels: ["ui","frontend","css","indigo","inter","docusaurus","architecture"]
links:
  spec: specs/006-ui-redesign/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-ui-redesign/plan.md
  - specs/006-ui-redesign/research.md
  - specs/006-ui-redesign/quickstart.md
  - .github/agents/copilot-instructions.md
tests:
  - "No tests run at plan stage"
  - "SC-002: python -m pytest tests/ -v (must remain 112 passed post-implementation)"
  - "SC-003: npm run build (must complete without errors)"
---

## Prompt

architect the implementation approach properly

## Response snapshot

Ran setup-plan.sh. Read the full frontend codebase (custom.css, auth-modal.css, chatbot.css, index.tsx, index.module.css, PersonalizeButton.tsx, UrduTranslateButton.tsx, docusaurus.config.ts, constitution.md). Made 7 design decisions with rationale and alternatives in research.md. Wrote complete plan.md covering Technical Context, Constitution Check (all 8 gates PASS), Phase 0/1 design sections with precise CSS variable values, keyframe animations, class names, and file-by-file change descriptions. Created quickstart.md with visual verification checklist. Updated agent context via script (TypeScript 5.x / Docusaurus 3.9 added).

## Outcome

- ✅ Impact: Comprehensive architecture plan covering 8 files (6 frontend + 1 config + 1 CSS module), 7 design decisions resolved, zero backend impact, zero new npm dependencies. Color palette chosen: deep indigo (#6366f1). Font: Inter via CDN. Hero: CSS gradient + animated gradient text. Navbar: backdrop-blur. Action buttons: .action-btn utility. Chatbot: gradient header + richer shadow. Auth modal: fixed hardcoded green focus ring.
- 🧪 Tests: SC-002 (112 backend tests) and SC-003 (npm run build) are the acceptance gates post-implementation
- 📁 Files: plan.md, research.md, quickstart.md, copilot-instructions.md (context update)
- 🔁 Next prompts: `/speckit.tasks` to generate implementation task list, then `/speckit.implement` to execute
- 🧠 Reflection: Constitution Principle VI ("No Over-Engineering") cleanly resolved all decisions — pure CSS approach, no animation libraries, no additional packages. The indigo palette decision is the single highest-impact change (affects every UI element that uses --ifm-color-primary).

## Evaluation notes (flywheel)

- Failure modes observed: None — all design decisions were deterministic given the codebase audit
- Graders run and results (PASS/FAIL): Constitution Check 8/8 PASS
- Prompt variant (if applicable): speckit.plan
- Next experiment (smallest change to try): Run /speckit.tasks to produce granular, independently testable implementation tasks
