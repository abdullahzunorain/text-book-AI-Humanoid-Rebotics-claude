# Implementation Plan: Fix Signin Crash & Chatbot Selection Stale Closure

**Branch**: `014-fix-signin-selection-bugs` | **Date**: 2026-03-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-fix-signin-selection-bugs/spec.md`

## Summary

Two surgical production bug fixes: (1) Guard against NULL `password_hash` in the signin endpoint to prevent a 500 `AttributeError` crash, returning 401 instead. (2) Add `selectedContext` to the `useCallback` dependency array in `ChatbotWidget.tsx` so the `sendMessage` closure reads current state instead of stale initial `null`.

## Technical Context

**Language/Version**: Python 3.13.2 (backend), TypeScript / React 19 (frontend)
**Primary Dependencies**: FastAPI 0.115.x, bcrypt, asyncpg (backend); Docusaurus 3.9.2, React 19 (frontend)
**Storage**: Neon PostgreSQL (asyncpg pool) — `users` table with `id`, `email`, `password_hash` columns
**Testing**: pytest + FastAPI TestClient (backend, 142 existing tests); no frontend unit tests currently
**Target Platform**: Railway (backend API), Vercel/static (frontend Docusaurus site)
**Project Type**: Web application (FastAPI REST API + Docusaurus SPA)
**Performance Goals**: N/A — these are correctness fixes, no performance change
**Constraints**: Zero regressions to existing 142 backend tests; zero change to API contracts
**Scale/Scope**: 2 files modified, ~5 lines changed total, 1 new test added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Rationale |
|-----------|--------|-----------|
| I. MVP-First | ✅ PASS | Bug fixes only — no new features, smallest viable diff |
| II. No Auth scope creep | ✅ PASS | Not adding auth features; fixing existing crash in auth endpoint |
| III. Content Scope | ✅ PASS | No content changes |
| IV. Chatbot Omnipresence | ✅ PASS | Fix ensures selected-text queries actually work (restoring intended behavior) |
| V. Deployability | ✅ PASS | Both fixes are deploy-ready, fully reversible |
| VI. No Over-Engineering | ✅ PASS | One guard clause + one dependency array entry — minimal possible fixes |
| Tech Stack | ✅ PASS | No new dependencies, same languages, same frameworks |
| No Hardcoded Secrets | ✅ PASS | No secrets involved |
| Testing Standard | ✅ PASS | Adding test for NULL password_hash edge case |

**Gate Result: ALL PASS — proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/014-fix-signin-selection-bugs/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── spec.md              # Feature specification (already created)
└── checklists/
    └── requirements.md  # Spec checklist (already created, 12/12 pass)
```

### Source Code (files to modify)

```text
backend/
├── routes/
│   └── auth.py              # Bug 1: Add NULL guard at line 140
└── tests/
    └── test_auth_api.py     # New test: signin with NULL password_hash → 401

website/
└── src/
    └── components/
        └── ChatbotWidget.tsx  # Bug 2: Fix useCallback dependency array at line 158
```

**Structure Decision**: Existing web application structure (backend/ + website/). No new files created — only modifications to 2 source files and 1 test file.

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Constitution Re-Check (Post-Design)

*GATE: Re-evaluated after Phase 1 design artifacts are complete.*

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. MVP-First | ✅ PASS | research.md confirms smallest viable fixes chosen |
| II. No Auth scope creep | ✅ PASS | No new auth features — guard clause only |
| III. Content Scope | ✅ PASS | No content changes in design |
| IV. Chatbot Omnipresence | ✅ PASS | data-model.md confirms selected-text flow is restored |
| V. Deployability | ✅ PASS | Both changes are backward-compatible, deploy-safe |
| VI. No Over-Engineering | ✅ PASS | No abstractions, no new files, no new patterns |
| Testing Standard | ✅ PASS | 1 new test covers the NULL hash edge case |

**Post-Design Gate Result: ALL PASS.**

## Design Decisions

### DD-1: Guard clause placement (Bug 1)

**Decision**: Add the NULL/empty guard inline within the existing conditional at `routes/auth.py:140`, combining it with the `verify_password()` call using short-circuit `or`.

**Pattern**:
```python
# BEFORE (crashes on None)
if not verify_password(body.password, user["password_hash"]):
    raise HTTPException(status_code=401, detail="Invalid email or password")

# AFTER (guard + verify in one expression)
if not user["password_hash"] or not verify_password(body.password, user["password_hash"]):
    raise HTTPException(status_code=401, detail="Invalid email or password")
```

**Rationale**: Python's short-circuit evaluation means `verify_password()` is never called when `password_hash` is falsy (None or empty string). One line change, same error message, same 401 status — no behavioral change for valid users.

### DD-2: Dependency array fix (Bug 2)

**Decision**: Add `selectedContext` to the `useCallback` dependency array.

**Pattern**:
```tsx
// BEFORE (stale closure)
}, []);

// AFTER (reactive to selectedContext changes)
}, [selectedContext]);
```

**Rationale**: Standard React memoization pattern. `sendMessage` reads `selectedContext` in its body, so it must be listed as a dependency. React will recreate the callback only when `selectedContext` changes (infrequent — on selection/dismissal only).

### DD-3: No contracts/ directory for this feature

**Decision**: Skip `contracts/` generation. These are bug fixes with zero API contract changes. The `POST /api/auth/signin` response schema is unchanged (still 200 or 401). The `POST /api/chat` request schema is unchanged (`selected_text` remains nullable string).

## Implementation Sequence

```
1. backend/routes/auth.py       — Add NULL guard (DD-1)
2. backend/tests/test_auth_api.py — Add test_signin_null_password_hash_returns_401
3. pytest (verify 143 tests pass, 0 failures)
4. website/src/components/ChatbotWidget.tsx — Fix dependency array (DD-2)
5. Manual verification: highlight text → type message → check Network tab for selected_text
```

## Artifacts Generated

| Artifact | Path | Status |
|----------|------|--------|
| Plan | `specs/014-fix-signin-selection-bugs/plan.md` | ✅ Complete |
| Research | `specs/014-fix-signin-selection-bugs/research.md` | ✅ Complete |
| Data Model | `specs/014-fix-signin-selection-bugs/data-model.md` | ✅ Complete |
| Contracts | N/A — no API changes | Skipped (justified in DD-3) |
| Quickstart | N/A — no new setup needed | Skipped (bug fixes to existing code) |
