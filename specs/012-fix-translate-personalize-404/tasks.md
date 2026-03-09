# Tasks: Fix Translate & Personalize 404 Errors on Railway

**Input**: Design documents from `/specs/012-fix-translate-personalize-404/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included — the spec requires all 119+ existing tests to pass (FR-008) and a new docs-availability test.

**Organization**: Tasks grouped by user story. US1 (translate) and US2 (personalize) share a common setup phase. US3 (E2E verification) depends on both.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Copy the 18 markdown files into `backend/docs/` so Railway includes them in the container. Update `railway.json` watch patterns.

- [X] T001 Copy `website/docs/` directory tree into `backend/docs/` preserving folder structure (18 files across intro/, module1-ros2/, module2-simulation/, module3-isaac/, module4-vla/)
- [X] T002 Verify `backend/docs/` contains all 18 expected markdown files matching `website/docs/` content exactly
- [X] T003 Update `watchPatterns` in `backend/railway.json` to include `backend/docs/**` so doc changes trigger redeploys

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational tasks needed — this feature modifies only two path constants and adds static files. The existing FastAPI app, auth, database, and middleware are already in place from prior features.

**⚠️ NOTE**: Phase 1 (Setup) MUST be complete before US1/US2 implementation, because the path resolution update references `backend/docs/`.

**Checkpoint**: Setup complete — the 18 markdown files exist in `backend/docs/` and `railway.json` is updated.

---

## Phase 3: User Story 1 — Translate Chapter Returns Content Instead of 404 (Priority: P1) 🎯 MVP

**Goal**: `POST /api/translate` returns HTTP 200 with translated content for any valid chapter slug on Railway, instead of the current 404.

**Independent Test**: `curl -X POST -H "Content-Type: application/json" -b cookies.txt -d '{"chapter_slug":"module1-ros2/01-architecture"}' https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/api/translate` → HTTP 200 with `translated_content` field.

### Implementation for User Story 1

- [X] T004 [US1] Update `_DOCS_DIR` path resolution in `backend/routes/translate.py` (line 54) — set primary path to `Path(__file__).resolve().parent.parent / "docs"` with fallback to `Path(__file__).resolve().parent.parent.parent / "website" / "docs"` for local development
- [X] T005 [US1] Verify existing translate tests still pass by running `python -m pytest backend/tests/test_translate_api.py backend/tests/test_translation_service.py -v` — 16/16 PASSED

**Checkpoint**: Translate endpoint resolves docs from `backend/docs/` on Railway and falls back to `website/docs/` locally. All translate tests pass.

---

## Phase 4: User Story 2 — Personalize Chapter Returns Content Instead of 404 (Priority: P1)

**Goal**: `POST /api/personalize` returns HTTP 200 with personalized content for any valid chapter slug on Railway, instead of the current 404.

**Independent Test**: `curl -X POST -H "Content-Type: application/json" -b cookies.txt -d '{"chapter_slug":"module1-ros2/01-architecture"}' https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/api/personalize` → HTTP 200 with `personalized_content` field.

### Implementation for User Story 2

- [X] T006 [US2] Update `_DOCS_ROOT` path resolution in `backend/services/personalization_service.py` (line 86) — set primary path to `pathlib.Path(__file__).resolve().parent.parent / "docs"` with fallback to `pathlib.Path(__file__).resolve().parent.parent.parent / "website" / "docs"` for local development
- [X] T007 [US2] Verify existing personalize tests still pass by running `python -m pytest backend/tests/test_personalization_service.py backend/tests/test_personalize_api.py backend/tests/test_personalize_cache.py -v` — 15/15 PASSED

**Checkpoint**: Personalize endpoint resolves docs from `backend/docs/` on Railway and falls back to `website/docs/` locally. All personalize tests pass.

---

## Phase 5: User Story 3 — All Backend Endpoints Work End-to-End in Production (Priority: P2)

**Goal**: Verify every FastAPI endpoint works correctly after the fix — zero regressions across health, chat, auth, translate, personalize, history, and background endpoints.

**Independent Test**: Run the full backend test suite (119+ tests) and execute the quickstart.md verification runbook against the Railway deployment.

### Tests for User Story 3

- [X] T008 [P] [US3] Create `backend/tests/test_docs_available.py` — test that `backend/docs/` directory exists, contains exactly 18 `.md` files across 5 subdirectories, and that both primary and fallback path resolution logic works correctly
- [X] T009 [US3] Run full backend test suite: `cd backend && python -m pytest tests/ -v` — 142/142 PASSED (119 original + 23 new)

### Verification for User Story 3

- [ ] T010 [US3] Deploy updated branch to Railway and verify `/health` returns 200
- [ ] T011 [US3] Execute quickstart.md verification runbook steps 2-5 against Railway: sign in, test translate endpoint (SC-001), test personalize endpoint (SC-002), verify chat and history still work (SC-003)
- [ ] T012 [US3] Verify full user flow on live site: confirm frontend translate/personalize buttons trigger successful API calls to Railway backend (SC-004)

**Checkpoint**: All endpoints return expected responses. Zero 404/500 errors for valid requests. Full user flow succeeds.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and documentation

- [ ] T013 [P] Verify `backend/docs/` files match `website/docs/` files exactly (no drift) by comparing file counts and names
- [ ] T014 [P] Update spec.md status from "Draft" to "Complete" in `specs/012-fix-translate-personalize-404/spec.md`
- [ ] T015 Commit all changes, push to branch `012-fix-translate-personalize-404`, and create PR to main

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **User Story 1 (Phase 3)**: Depends on Setup (Phase 1) — needs `backend/docs/` to exist
- **User Story 2 (Phase 4)**: Depends on Setup (Phase 1) — needs `backend/docs/` to exist
- **User Story 3 (Phase 5)**: Depends on US1 (Phase 3) and US2 (Phase 4) — verification of the complete fix
- **Polish (Phase 6)**: Depends on US3 (Phase 5) — only after full verification

### User Story Dependencies

- **US1 (Translate)**: Depends on Phase 1 only. Independent of US2.
- **US2 (Personalize)**: Depends on Phase 1 only. Independent of US1.
- **US3 (E2E Verification)**: Depends on US1 + US2 completion.

### Within Each User Story

- Path constant update before test verification
- Local test pass before Railway deployment
- Railway deployment before E2E verification

### Parallel Opportunities

- **T004 and T006** (US1 + US2 path updates) CAN run in parallel — they modify different files (`translate.py` vs `personalization_service.py`)
- **T005 and T007** (US1 + US2 test verification) CAN run in parallel after their respective implementations
- **T008 and T013** are marked [P] — can run in parallel with other tasks in their phase
- **US1 and US2 phases** can be executed in parallel since they touch different files and have no cross-dependencies

---

## Parallel Example: US1 + US2 (Phases 3 & 4)

```text
After Phase 1 (Setup) completes:

Thread A (US1 - Translate):              Thread B (US2 - Personalize):
─────────────────────────────            ──────────────────────────────
T004 Update translate.py path    ||      T006 Update personalization_service.py path
T005 Run translate tests         ||      T007 Run personalize tests

Both complete → Phase 5 (US3 - E2E Verification)
```

---

## Implementation Strategy

### MVP Scope

**MVP = Phase 1 + Phase 3 (US1)**: Copy docs into `backend/docs/` and fix the translate endpoint. This alone resolves the most visible production failure. However, since US1 and US2 share the same root cause and fix pattern, and US2 modifies a different file, it is efficient to implement both in the same pass.

**Recommended approach**: Execute Phases 1–4 together (Setup + US1 + US2), then verify with Phase 5 (US3).

### Incremental Delivery

1. **Phase 1**: Copy docs — creates the foundation (adds ~192KB of markdown)
2. **Phase 3+4**: Fix both path constants — 2 lines of logic per file, minimal risk
3. **Phase 5**: Verify everything works — tests + Railway deployment + quickstart runbook
4. **Phase 6**: Polish and PR

### Risk Mitigation

- **File drift risk**: `backend/docs/` must stay in sync with `website/docs/`. Mitigated by T013 (sync check). Future: add a CI step to auto-sync.
- **Path resolution risk**: Fallback to `website/docs/` ensures local development isn't affected even if `backend/docs/` is missing. Mitigated by T005, T007, T009.
- **Regression risk**: Full test suite (119+ tests) run in T009 catches any unintended side effects. No existing API contracts change.

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 15 |
| **Tasks per US** | US1: 2, US2: 2, US3: 5, Setup: 3, Polish: 3 |
| **Parallel opportunities** | US1 + US2 can run in parallel; T008 + T013 parallelizable |
| **Files created** | `backend/docs/` (18 .md files), `backend/tests/test_docs_available.py` |
| **Files modified** | `backend/routes/translate.py`, `backend/services/personalization_service.py`, `backend/railway.json` |
| **MVP scope** | Phase 1 + Phase 3 (US1) — but recommend all of Phases 1–4 |
| **Format validation** | ✅ All tasks follow `- [ ] [TaskID] [labels] Description with file path` |
