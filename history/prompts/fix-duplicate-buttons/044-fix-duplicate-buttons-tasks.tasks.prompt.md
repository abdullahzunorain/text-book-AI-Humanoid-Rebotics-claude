---
id: 044
title: Fix Duplicate Buttons Tasks
stage: tasks
date: 2026-03-11
surface: agent
model: Claude Opus 4.6
feature: fix-duplicate-buttons
branch: 016-fix-duplicate-buttons
user: zunorain
command: /speckit.tasks
labels: ["tasks", "bug-fix", "duplicate-buttons", "frontend", "react"]
links:
  spec: specs/016-fix-duplicate-buttons/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/016-fix-duplicate-buttons/tasks.md
tests:
  - null
---

## Prompt

Follow instructions in speckit.tasks.prompt.md.

## Response snapshot

Generated `tasks.md` for feature 016-fix-duplicate-buttons with 11 tasks organized across 6 phases:

- **Phase 1 (Setup)**: 1 task — verify TypeScript baseline
- **Phase 2 (Foundational)**: Skipped — no shared infrastructure needed for a bug fix
- **Phase 3 (US1 — Personalization, P1)**: 3 tasks — remove inline "Show Original" button, remove `onShowOriginal` prop, clean LayoutWrapper
- **Phase 4 (US2 — Translation, P1)**: 3 tasks — remove inline "Read in English" button, remove `onShowEnglish` prop, clean LayoutWrapper
- **Phase 5 (US3 — Chatbot, P2)**: 1 task — hide floating toggle when panel open
- **Phase 6 (Polish)**: 3 tasks — tsc check, pytest regression, manual quickstart verification

Key features: all 3 user stories are fully parallelizable (different files), within-story [P] markers for independent edits, sequential LayoutWrapper cleanup, clear checkpoints per story.

## Outcome

- ✅ Impact: Complete task breakdown ready for /speckit.implement execution
- 🧪 Tests: Not requested in spec; no test tasks generated
- 📁 Files: 1 artifact created (tasks.md)
- 🔁 Next prompts: `/speckit.implement` to execute all 11 tasks
- 🧠 Reflection: Simple bug fix maps cleanly to user stories — each story is one component file + one LayoutWrapper line

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Format validation PASS (11 checkboxes, 7 US labels, 4 non-US tasks, sequential IDs)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
