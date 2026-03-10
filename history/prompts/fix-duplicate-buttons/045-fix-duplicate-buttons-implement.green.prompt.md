---
id: 045
title: Fix Duplicate Buttons Implement
stage: green
date: 2026-03-11
surface: agent
model: Claude Opus 4.6
feature: fix-duplicate-buttons
branch: 016-fix-duplicate-buttons
user: zunorain
command: /speckit.implement
labels: ["implement", "bug-fix", "duplicate-buttons", "frontend", "react"]
links:
  spec: specs/016-fix-duplicate-buttons/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - website/src/components/PersonalizedContent.tsx
  - website/src/components/UrduContent.tsx
  - website/src/components/ChatbotWidget.tsx
  - website/src/theme/DocItem/Layout/index.tsx
  - specs/016-fix-duplicate-buttons/tasks.md
tests:
  - "npx tsc --noEmit: 0 errors"
  - "uv run pytest tests/ -q: 143 passed"
---

## Prompt

Follow instructions in speckit.implement.prompt.md.

## Response snapshot

Executed all 11 tasks from tasks.md for feature 016-fix-duplicate-buttons:

**Phase 1 (Setup)**:
- T001: TSC baseline verified clean (0 errors)

**Phase 3 (US1 — Personalization, P1)**:
- T002: Removed inline "Show Original" `<button>` from PersonalizedContent banner div
- T003: Removed `onShowOriginal` prop from `PersonalizedContentProps` interface and destructuring
- T004: Removed `onShowOriginal={handleShowOriginal}` from LayoutWrapper `<PersonalizedContent>` JSX

**Phase 4 (US2 — Translation, P1)**:
- T005: Removed inline "Read in English" `<button>` from UrduContent
- T006: Removed `onShowEnglish` prop from `UrduContentProps` interface and destructuring
- T007: Removed `onShowEnglish={handleShowEnglish}` from LayoutWrapper `<UrduContent>` JSX

**Phase 5 (US3 — Chatbot, P2)**:
- T008: Wrapped floating toggle in `{!isOpen && ...}` — hidden when panel open, only shows 💬 to open

**Phase 6 (Polish)**:
- T009: `npx tsc --noEmit` — 0 errors ✅
- T010: `uv run pytest tests/ -q` — 143/143 passed ✅
- T011: Manual quickstart verification — pending user action

4 files modified, ~15 lines net removed. All tasks marked [x] in tasks.md.

## Outcome

- ✅ Impact: All 3 duplicate button bugs fixed (BUG-006, BUG-007, BUG-008)
- 🧪 Tests: TSC 0 errors, 143/143 pytest passed
- 📁 Files: 4 source files modified, tasks.md updated with [x] marks
- 🔁 Next prompts: Manual verification via quickstart.md, then `/sp.git.commit_pr` to commit and push
- 🧠 Reflection: Clean minimal fix — button removal + prop cleanup + conditional rendering. No new abstractions needed.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): TSC PASS, pytest PASS (143/143)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
