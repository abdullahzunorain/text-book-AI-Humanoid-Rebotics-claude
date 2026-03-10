# Tasks: Fix Signin Crash & Chatbot Selection Stale Closure

**Input**: Design documents from `/specs/014-fix-signin-selection-bugs/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: Unit test included for US1 (SC-001 requires verification by unit test). No TDD red-green cycle — test is written alongside the fix.

**Organization**: Tasks grouped by user story. Both stories are P1 but independent — US1 is backend-only, US2 is frontend-only. They can be executed in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: No setup needed — both fixes target existing files in an existing codebase. No new dependencies, no schema changes, no new files.

*Phase skipped — proceed to Phase 2.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational work needed — both bugs are isolated to their respective files with no shared infrastructure changes.

*Phase skipped — proceed to user story phases.*

---

## Phase 3: User Story 1 — Signin With NULL Password Hash (Priority: P1) 🎯

**Goal**: Prevent 500 `AttributeError` crash when `password_hash` is `NULL` in the database. Return 401 "Invalid email or password" instead.

**Independent Test**: Call `POST /api/auth/signin` with an email whose `password_hash` is `NULL` in the database → expect 401 response, not 500.

### Implementation for User Story 1

- [X] T001 [US1] Add NULL/empty guard for `password_hash` before `verify_password()` call in `backend/routes/auth.py`
  - Change line 140 from: `if not verify_password(body.password, user["password_hash"]):`
  - To: `if not user["password_hash"] or not verify_password(body.password, user["password_hash"]):`
  - Python short-circuit evaluation ensures `verify_password()` is never called when hash is falsy
  - Same 401 error message, same `HTTPException` — no behavioral change for valid users
  - Covers both `None` and empty string `""` edge cases (per spec Edge Cases)

- [X] T002 [US1] Add `test_signin_null_password_hash_returns_401` test in `backend/tests/test_auth_api.py`
  - Add new test method in `TestSignin` class
  - Mock `pool.fetchrow` to return `{"id": 1, "email": "user@example.com", "password_hash": None}`
  - Assert `response.status_code == 401`
  - Follows existing test pattern (see `test_signin_wrong_password_returns_401` for reference)

- [X] T003 [US1] Run pytest and verify 143 tests pass (142 existing + 1 new) with 0 failures in `backend/`
  - Command: `cd backend && python -m pytest tests/ -v`
  - Validates SC-001 (NULL hash → 401) and SC-003 (zero regressions)

**Checkpoint**: Signin with NULL `password_hash` returns 401 instead of 500. All 143 backend tests pass.

---

## Phase 4: User Story 2 — Selected Text Sent to Backend (Priority: P1) 🎯

**Goal**: Fix the stale closure so `sendMessage` reads current `selectedContext` state, ensuring `selected_text` is populated in chat requests when the selection banner is visible.

**Independent Test**: Highlight text on a doc page → see banner in chatbot → type "translate into roman urdu" → press Enter → verify `selected_text` is non-null in the Network tab request payload.

### Implementation for User Story 2

- [X] T004 [P] [US2] Add `selectedContext` to `useCallback` dependency array in `website/src/components/ChatbotWidget.tsx`
  - Change line 158 from: `}, []);`
  - To: `}, [selectedContext]);`
  - Standard React pattern — `sendMessage` reads `selectedContext` in its body, so it must be a dependency
  - React recreates the callback only when `selectedContext` changes (infrequent — on selection/dismissal)
  - No other code changes needed — `handleSubmit` and `handleKeyDown` already call `sendMessage(input)` correctly

**Checkpoint**: Selected text from the banner is included as `selected_text` in every `POST /api/chat` request. Roman Urdu transliteration works end-to-end.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across both user stories.

- [X] T005 Verify no TypeScript/build errors in `website/` by running Docusaurus build check
- [X] T006 Run full backend test suite one final time to confirm 143 tests pass in `backend/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Skipped — no setup needed
- **Phase 2 (Foundational)**: Skipped — no shared infrastructure
- **Phase 3 (US1)**: No dependencies — can start immediately
- **Phase 4 (US2)**: No dependencies — can start immediately, **can run in parallel with Phase 3**
- **Phase 5 (Polish)**: Depends on Phase 3 and Phase 4 completion

### User Story Dependencies

- **US1 (Signin guard)**: Backend-only. Independent of US2. No cross-story dependency.
- **US2 (Stale closure)**: Frontend-only. Independent of US1. No cross-story dependency.

### Within Each User Story

- **US1**: T001 (fix) → T002 (test) → T003 (validate) — sequential within story
- **US2**: T004 (fix) — single task, no internal dependencies

### Parallel Opportunities

- **T001 and T004 can run in parallel** — different repositories (backend vs. website), different languages, no shared state
- **T002 depends on T001** — test validates the guard clause
- **T003 depends on T002** — full suite run after new test is added
- **T005 and T006 can run in parallel** — different projects (website build vs. backend pytest)

---

## Parallel Example: US1 + US2

```bash
# These can run simultaneously:
# Developer A (backend):
Task T001: Add NULL guard in backend/routes/auth.py
Task T002: Add test in backend/tests/test_auth_api.py
Task T003: Run pytest — 143 tests pass

# Developer B (frontend):
Task T004: Fix dependency array in website/src/components/ChatbotWidget.tsx

# After both complete:
Task T005: Verify website build
Task T006: Final backend test suite run
```

---

## Implementation Strategy

### MVP First (Both Stories Are MVP)

Both user stories are P1 — both are critical bug fixes required for the app to function correctly. There is no phased delivery; both must be fixed.

1. Execute T001 → T002 → T003 (US1: backend signin fix + test + validate)
2. Execute T004 (US2: frontend closure fix)
3. Execute T005, T006 (Polish: final validation)
4. **DONE**: Both bugs fixed, 143 tests pass, zero regressions

### Incremental Delivery

1. After T003: Signin crash is fixed — deployable independently
2. After T004: Selected text works — deployable independently
3. After T006: Full validation complete — ready for commit and PR

---

## Notes

- Total tasks: **6**
- Tasks per user story: US1 = 3, US2 = 1, Polish = 2
- Parallel opportunities: T001 ∥ T004 (cross-story), T005 ∥ T006 (polish)
- Independent test criteria: US1 — pytest 143/143 pass; US2 — Network tab shows `selected_text` populated
- Suggested MVP scope: Both stories (both are P1)
- Format validation: ✅ All tasks follow `- [ ] [TaskID] [labels] Description with file path` format
