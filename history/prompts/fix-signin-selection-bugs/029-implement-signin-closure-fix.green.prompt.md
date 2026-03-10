---
id: 029
title: Implement Signin Guard and Closure Fix
stage: green
date: 2026-03-11
surface: agent
model: claude-opus-4-20250514
feature: fix-signin-selection-bugs
branch: 014-fix-signin-selection-bugs
user: zunorain
command: /speckit.implement
labels: ["bugfix", "implementation", "signin", "stale-closure", "guard-clause", "useCallback"]
links:
  spec: specs/014-fix-signin-selection-bugs/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/routes/auth.py
  - backend/tests/test_auth_api.py
  - website/src/components/ChatbotWidget.tsx
  - specs/014-fix-signin-selection-bugs/tasks.md
tests:
  - backend/tests/test_auth_api.py::TestSignin::test_signin_null_password_hash_returns_401
  - 143 passed, 0 failures (final pytest run)
---

## Prompt

Follow instructions in speckit.implement.prompt.md. Task breakdown.

## Response snapshot

Executed all 6 tasks from tasks.md:

**Phase 3 — US1 (Signin NULL hash fix):**
- T001: Added NULL/empty guard in `backend/routes/auth.py` line 140 — `if not user["password_hash"] or not verify_password(...):`
- T002: Added `test_signin_null_password_hash_returns_401` in `backend/tests/test_auth_api.py`
- T003: pytest 143/143 passed (142 existing + 1 new), 0 failures

**Phase 4 — US2 (Stale closure fix):**
- T004: Changed `}, []);` to `}, [selectedContext]);` in `website/src/components/ChatbotWidget.tsx` line 158

**Phase 5 — Polish:**
- T005: TypeScript build check — `tsc --noEmit` exit code 0, no errors
- T006: Final pytest run — 143 passed in 36.15s, 0 failures

**Side fix:** Installed missing `openai` and `openai-agents` packages in `pyproject.toml` (pre-existing dependency gap, not related to our bug fixes).

## Outcome

- ✅ Impact: Both P1 production bugs fixed — signin no longer crashes on NULL hash, selected text is now sent to backend
- 🧪 Tests: 143/143 passed, 0 failures, 0 regressions. TSC clean.
- 📁 Files: 3 source files modified (auth.py, test_auth_api.py, ChatbotWidget.tsx), tasks.md updated (6/6 checked)
- 🔁 Next prompts: /sp.git.commit_pr to commit and push
- 🧠 Reflection: Both fixes were surgical (~5 lines total). Pre-existing missing deps (openai, openai-agents) in pyproject.toml caused test collection failures — resolved as a side effect.

## Evaluation notes (flywheel)

- Failure modes observed: Pre-existing missing openai/openai-agents in pyproject.toml blocked test collection. Resolved by `uv add openai openai-agents`.
- Graders run and results (PASS/FAIL): pytest 143/143 PASS, tsc --noEmit PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
