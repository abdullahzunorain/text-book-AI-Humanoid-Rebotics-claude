---
id: 4
title: Implement Fix for Translate Personalize 404 Errors
stage: green
date: 2026-03-09
surface: agent
model: claude-opus-4-6
feature: 012-fix-translate-personalize-404
branch: 012-fix-translate-personalize-404
user: abdullahzunorain
command: /speckit.implement
labels: ["implement", "translate", "personalize", "railway", "404-fix", "deploy"]
links:
  spec: specs/012-fix-translate-personalize-404/spec.md
  ticket: null
  adr: null
  pr: https://github.com/abdullahzunorain/text-book-AI-Humanoid-Rebotics-CLAUDE/pull/9
files:
  - backend/docs/ (18 .md files + 3 _category_.json copied from website/docs/)
  - backend/routes/translate.py (modified _DOCS_DIR path resolution)
  - backend/services/personalization_service.py (modified _DOCS_ROOT path resolution)
  - backend/railway.json (updated watchPatterns)
  - backend/tests/test_docs_available.py (new — 23 tests)
  - specs/012-fix-translate-personalize-404/tasks.md (updated task status)
  - specs/012-fix-translate-personalize-404/spec.md (status → Complete)
tests:
  - 142/142 backend tests passed (119 existing + 23 new)
  - 16/16 translate tests passed
  - 15/15 personalize tests passed
  - Railway E2E: translate 200, personalize 200, chat 200, history 200
---

## Prompt

Follow instructions in speckit.implement.prompt.md to execute all 15 tasks properly step by step

## Response snapshot

Executed all 15 tasks across 6 phases for feature 012-fix-translate-personalize-404:

**Phase 1 (Setup)**: Copied 18 markdown files from `website/docs/` to `backend/docs/`, verified file count and structure, updated `railway.json` watchPatterns.

**Phase 3 (US1 - Translate)**: Updated `_DOCS_DIR` in `backend/routes/translate.py` — primary path `backend/docs/`, fallback `website/docs/` for local dev. 16/16 translate tests passed.

**Phase 4 (US2 - Personalize)**: Updated `_DOCS_ROOT` in `backend/services/personalization_service.py` — same dual-path pattern. 15/15 personalize tests passed.

**Phase 5 (US3 - E2E Verification)**: Created `test_docs_available.py` (23 tests). Full suite: 142/142 passed. Merged PR #9 to main. Railway deployed. Verified:
- `/health` → 200
- `POST /api/translate` with auth → 200 + Urdu content
- `POST /api/personalize` with auth → 200 + personalized content
- `POST /api/chat` → 200 + answer + sources
- `/api/chat/history` → 200
- Path traversal slug → 400
- Nonexistent slug → 404 with "Chapter not found"

**Phase 6 (Polish)**: Docs sync verified (zero drift), spec status updated to Complete, PR #10 merged for task status.

## Outcome

- ✅ Impact: Both translate and personalize endpoints now return 200 with content on Railway, fixing the 404 errors that affected all 18 chapters
- 🧪 Tests: 142/142 all pass (119 existing + 23 new docs availability tests)
- 📁 Files: 21 created (18 docs + 3 _category_.json + 1 test), 3 modified (translate.py, personalization_service.py, railway.json)
- 🔁 Next prompts: None — feature complete and deployed
- 🧠 Reflection: Simple root cause (path outside container), simple fix (copy + dual-path). The 2-line path resolution change with fallback is clean and handles both Railway and local dev.

## Evaluation notes (flywheel)

- Failure modes observed: None — all 15 tasks completed without errors
- Graders run and results (PASS/FAIL): SC-001 PASS, SC-002 PASS, SC-003 PASS, SC-004 PASS (via curl), SC-005 PASS (142 tests), SC-006 PASS (auto-deploy from main)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Add CI step to auto-sync website/docs/ → backend/docs/ to prevent future drift
