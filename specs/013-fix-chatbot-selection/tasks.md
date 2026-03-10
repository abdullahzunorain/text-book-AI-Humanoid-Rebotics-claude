# Tasks: Fix Chatbot Selection-Based Q&A & Roman Urdu

**Input**: Design documents from `/specs/013-fix-chatbot-selection/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested in the feature specification. Test tasks are included only for the backend Roman Urdu branching logic (critical new behavior) to prevent regression, since existing backend test infrastructure is already in place.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — this is a bug fix on an existing codebase. This phase verifies the development environment is ready.

- [X] T001 Verify backend dev environment starts correctly by running `cd backend && pip install -r requirements.txt && python migrate.py` per quickstart.md
- [X] T002 Verify frontend dev environment starts correctly by running `cd website && npm install && npm start` per quickstart.md
- [X] T003 [P] Verify current test suite passes by running `cd backend && python -m pytest tests/ -v` to establish baseline

**Checkpoint**: Dev environment confirmed working; baseline test suite green.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the Roman Urdu detection regex constant to the backend — this is shared by US2 and the no-selection guard, and must exist before either story's implementation.

**⚠️ CRITICAL**: The regex constant is used by both US2 (Roman Urdu transliteration) and the no-selection guard. It must be added first.

- [X] T004 Add `import re` and define `_ROMAN_URDU_RE` regex constant at module level in `backend/rag_service.py` (after existing imports, before `COLLECTION_NAME`). Pattern: `re.compile(r"roman\s*urdu|urdu\s*m(?:ein|en)\s*(?:likh|translate|bata)", re.IGNORECASE)` per research.md decision #3

**Checkpoint**: `_ROMAN_URDU_RE` constant available for use in `generate_answer()`. No behavioral change yet.

---

## Phase 3: User Story 1 — Selection-Scoped Q&A (Priority: P1) 🎯 MVP

**Goal**: Fix the bug where selected text context is lost after the first message. After this phase, users can ask multiple follow-up questions about a highlighted passage and the selection banner persists.

**Independent Test**: Select any paragraph, open chatbot via "Ask AI" popup, ask "What does this mean?", then ask a follow-up "Can you explain more?". Both answers must scope to the selection, and the yellow context banner must remain visible throughout.

### Implementation for User Story 1

- [X] T005 [US1] Remove `setSelectedContext(null); // Clear after sending` (line ~113) from the `sendMessage()` callback in `website/src/components/ChatbotWidget.tsx` — this is the one-line root cause fix per research.md decision #1 and frontend-state contract rule #2

**Checkpoint**: User Story 1 (P1 MVP) complete. Selection context persists across messages; banner stays visible; dismiss (×) button still works. Verify manually per quickstart.md Test 1 and Test 4.

---

## Phase 4: User Story 2 — Roman Urdu Transliteration of Selection (Priority: P2)

**Goal**: When a user selects text and asks for Roman Urdu translation, the chatbot transliterates only the selected passage to Latin-script Urdu, skipping RAG retrieval entirely. When no text is selected, return a helpful guidance message.

**Independent Test**: Select a 2–3 sentence passage, type "translate to roman urdu". Response must be Latin-script Urdu of only the selected text. Then without any selection, type "roman urdu mein translate karo" — should get guidance message.

### Implementation for User Story 2

- [X] T006 [US2] Add Roman Urdu + no-selection early return branch at the top of `generate_answer()` in `backend/rag_service.py`: if `_ROMAN_URDU_RE.search(question)` matches AND `selected_text is None`, return `{"answer": "Please select some text from the textbook first, then ask me to translate it to Roman Urdu. You can highlight any passage and click the 'Ask AI' popup to set the context.", "sources": []}` — per chat-api contract Case 4

- [X] T007 [US2] Add Roman Urdu + selected_text transliteration branch in `generate_answer()` in `backend/rag_service.py`: if `_ROMAN_URDU_RE.search(question)` matches AND `selected_text is not None`, skip embedding/retrieval, build transliteration prompt per research.md decision #4, call `await run_agent(tutor_agent, input=prompt)`, save chat history if `user_id`, return `{"answer": answer, "sources": []}` — per chat-api contract Case 3 and FR-011

- [X] T008 [US2] Verify the existing RAG pipeline (Cases 1 and 2 in chat-api contract) remains unchanged after the new branches — the `else` path in `generate_answer()` must be the original code with zero modifications per FR-007

**Checkpoint**: User Story 2 complete. Roman Urdu transliteration works scoped to selection; no-selection gives guidance; normal RAG unchanged. Verify manually per quickstart.md Tests 2, 3, and re-run Test 1 to confirm no regression.

---

## Phase 5: User Story 3 — No Regression on General Chatbot (Priority: P1)

**Goal**: Confirm the general chatbot (no selection, no Roman Urdu) still works correctly — no regression from the changes in US1 and US2.

**Independent Test**: Open chatbot without selecting text, ask any robotics question. Answer must be RAG-grounded and correct.

### Implementation for User Story 3

- [X] T009 [US3] Run the existing backend test suite with `cd backend && python -m pytest tests/ -v` and verify all tests pass — specifically `test_chat_api.py` for the POST /api/chat endpoint
- [X] T010 [US3] Run the existing Playwright E2E tests with `cd website && npx playwright test` if available, and verify chatbot widget renders and responds to non-selection queries

**Checkpoint**: All existing tests pass. General chatbot functionality confirmed unaffected. US3 validated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories and cleanup.

- [X] T011 Run full manual test suite from quickstart.md: Test 1 (selection persists), Test 2 (Roman Urdu), Test 3 (no-selection guidance), Test 4 (dismiss selection)
- [X] T012 Verify Roman Urdu regex covers all spec-required phrasings from FR-005: "roman urdu", "roman urdu mein", "translate to roman urdu", "roman urdu likho", "urdu mein translate karo", "urdu men bata"
- [X] T013 [P] Update spec.md status from "Draft" to "Implemented" in `specs/013-fix-chatbot-selection/spec.md`
- [X] T014 [P] Run quickstart.md validation — walk through every step and confirm accuracy

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup/Verify) ─────────────────────► Phase 2 (Foundational: regex constant)
                                                        │
                                    ┌───────────────────┼───────────────────┐
                                    ▼                   ▼                   │
                           Phase 3 (US1: P1)    Phase 4 (US2: P2)          │
                           Frontend fix         Backend branching           │
                                    │                   │                   │
                                    └───────┬───────────┘                   │
                                            ▼                               │
                                   Phase 5 (US3: P1)                        │
                                   Regression testing                       │
                                            │                               │
                                            ▼                               │
                                   Phase 6 (Polish) ◄──────────────────────┘
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2. **No dependency on other stories.** Frontend-only change.
- **User Story 2 (P2)**: Depends on Phase 2 (regex constant). **No dependency on US1.** Backend-only change.
- **User Story 3 (P1)**: Depends on US1 + US2 both being complete (regression validation).

### Within Each User Story

- US1: Single task (T005) — one-line removal
- US2: Sequential — T006 (no-selection guard) → T007 (transliteration branch) → T008 (verify existing path)
- US3: T009 and T010 can run in parallel (different test frameworks)

### Parallel Opportunities

- **Phase 3 (US1) and Phase 4 (US2) can run in parallel** — they modify different files (`ChatbotWidget.tsx` vs `rag_service.py`) with no cross-dependencies
- T001 and T002 can run in parallel (different dev environments)
- T009 and T010 can run in parallel (pytest vs Playwright)
- T013 and T014 can run in parallel (different files)

---

## Parallel Example: US1 + US2 Simultaneously

```
# Thread A (Frontend — US1):
T005: Remove setSelectedContext(null) from ChatbotWidget.tsx

# Thread B (Backend — US2):
T006: Add no-selection Roman Urdu guard in rag_service.py
T007: Add transliteration branch in rag_service.py
T008: Verify existing RAG path unchanged
```

Both threads can proceed immediately after Phase 2 (T004 — regex constant).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Verify dev environment (T001–T003)
2. Complete Phase 2: Add regex constant (T004)
3. Complete Phase 3: US1 — remove `setSelectedContext(null)` (T005)
4. **STOP and VALIDATE**: Selection persists across messages; banner stays visible
5. Deploy/demo if ready — this alone fixes the core reported bug

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3: US1 → Selection persistence fixed → **Deploy (MVP!)**
3. Phase 4: US2 → Roman Urdu transliteration working → Deploy
4. Phase 5: US3 → Regression confirmed clean → Deploy
5. Phase 6: Polish → Final validation → Close feature branch

### Summary

| Metric | Value |
|--------|-------|
| Total tasks | 14 |
| Phase 1 (Setup) | 3 tasks |
| Phase 2 (Foundational) | 1 task |
| Phase 3 / US1 (Selection fix) | 1 task |
| Phase 4 / US2 (Roman Urdu) | 3 tasks |
| Phase 5 / US3 (Regression) | 2 tasks |
| Phase 6 (Polish) | 4 tasks |
| Parallel opportunities | 4 (US1‖US2, T001‖T002, T009‖T010, T013‖T014) |
| Production files modified | 2 (`ChatbotWidget.tsx`, `rag_service.py`) |
| MVP scope | US1 only (T001–T005) |

---

## Notes

- This is a minimal bug fix — only 2 production files change
- No new files, no new dependencies, no schema migrations
- The existing UI banner (lines 226–241 of ChatbotWidget.tsx) + CSS (lines 334–372 of chatbot.css) already satisfy FR-012/FR-013 — they just weren't visible because the clearing bug hid them
- Commit after each phase for clean rollback points
- The regex pattern can be extended later without structural changes if new Roman Urdu phrasings are discovered
