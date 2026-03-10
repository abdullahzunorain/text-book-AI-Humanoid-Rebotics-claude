---
id: 023
title: Tasks Breakdown Chatbot Selection Fix
stage: tasks
date: 2026-03-10
surface: agent
model: claude-opus-4-6
feature: fix-chatbot-selection
branch: 013-fix-chatbot-selection
user: zunorain
command: speckit.tasks
labels: ["tasks", "chatbot", "selection", "roman-urdu", "bug-fix"]
links:
  spec: specs/013-fix-chatbot-selection/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/013-fix-chatbot-selection/tasks.md
tests:
  - none (task generation phase — no code or tests modified)
---

## Prompt

generate the task breakdown.

## Response snapshot

Generated tasks.md for feature 013-fix-chatbot-selection with 14 tasks organized across 6 phases and 3 user stories:

**Phase 1 (Setup)**: 3 tasks — verify dev environment and baseline tests
**Phase 2 (Foundational)**: 1 task — add `_ROMAN_URDU_RE` regex constant to rag_service.py
**Phase 3 / US1 (P1 MVP)**: 1 task — remove `setSelectedContext(null)` from ChatbotWidget.tsx sendMessage()
**Phase 4 / US2 (P2)**: 3 tasks — add no-selection guard, transliteration branch, verify existing RAG path
**Phase 5 / US3 (P1)**: 2 tasks — run pytest + Playwright regression tests
**Phase 6 (Polish)**: 4 tasks — manual test suite, regex coverage, spec status update, quickstart validation

Key characteristics:
- Only 2 production files modified (ChatbotWidget.tsx + rag_service.py)
- US1 and US2 can run in parallel (different files, no cross-dependencies)
- MVP scope = T001–T005 (just the selection persistence fix)
- 4 parallel opportunities identified
- Every task has exact file paths and references to design artifacts

## Outcome

- ✅ Impact: Complete task breakdown ready for speckit.implement execution
- 🧪 Tests: No tests run (task generation phase)
- 📁 Files: 1 file created (tasks.md)
- 🔁 Next prompts: Run `speckit.implement` to execute the task list
- 🧠 Reflection: 14 tasks is lean for a 2-file bug fix; the real work is in T005 (1 line) and T006/T007 (~25 lines)

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Format validation PASS — all 14 tasks have checkbox, ID, story labels where required, file paths
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run speckit.implement to execute tasks
