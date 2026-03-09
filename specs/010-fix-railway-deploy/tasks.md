# Tasks: Fix Railway Backend Deployment

**Input**: Design documents from `/specs/010-fix-railway-deploy/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Test updates are included because FR-009 requires all 112 existing tests to continue passing after `get_pool()` → `ensure_pool()` migration. New test file `test_migrate.py` is also generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Foundational config and module changes that all user stories depend on

- [X] T001 Update `backend/railway.json` to full config-as-code: add `watchPatterns: ["backend/**"]`, `healthcheckPath: "/health"`, `healthcheckTimeout: 120`, `sleepApplication: true`, and update `startCommand` to `"python migrate.py && uvicorn main:app --host 0.0.0.0 --port $PORT"`
- [X] T002 [P] Create Python migration runner in `backend/migrate.py` with `run_migrations(dsn)` function per contracts/migrate-runner.md: read sorted `.sql` files from `backend/migrations/`, execute via `asyncpg.connect()`, add CLI entry point `if __name__ == "__main__"`
- [X] T003 [P] Create migration runner tests in `backend/tests/test_migrate.py`: test sorted file discovery, test idempotent execution, test graceful skip when no DSN, test connection error propagation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core DB pool refactor that MUST complete before any user story caller updates

**⚠️ CRITICAL**: No user story work can begin until this phase is complete — all callers depend on the new `ensure_pool()` API.

- [X] T004 Refactor `backend/db.py`: replace `init_pool(dsn)` and `get_pool()` with async `ensure_pool() -> asyncpg.Pool` per contracts/db-lazy-pool.md — lazy init on first call, reads `DATABASE_URL` env var, `ssl="require"`, `min_size=2`, `max_size=10`; keep `close_pool()` unchanged
- [X] T005 Update `backend/main.py` lifespan: remove `init_pool(dsn)` call from startup, keep `close_pool()` in shutdown, remove the `try/except` block around DB init since pool is now lazy
- [X] T006 [P] Update `backend/main.py` CORS middleware: change `allow_headers=["Content-Type"]` to `allow_headers=["Content-Type", "Authorization"]` per research R4

**Checkpoint**: Foundation ready — `ensure_pool()` is the new DB API, `railway.json` is config-as-code, `migrate.py` exists. User story caller updates can now begin.

---

## Phase 3: User Story 1 — Chatbot Works End-to-End After Railway Deploy (Priority: P1) 🎯 MVP

**Goal**: Chatbot on GitHub Pages sends questions to Railway backend and receives RAG answers — even after serverless sleep wake-up.

**Independent Test**: Open GitHub Pages site, open chatbot, type "What is ROS 2?", verify response appears within 60 seconds.

**Relevant FRs**: FR-001, FR-004, FR-006, FR-010

### Caller Updates for User Story 1

- [X] T007 [P] [US1] Update `backend/services/chat_history_service.py`: change `from db import get_pool` to `from db import ensure_pool`, replace all `pool = get_pool()` calls (3 occurrences) with `pool = await ensure_pool()`
- [X] T008 [P] [US1] Update `backend/services/cache_service.py`: change `from db import get_pool` to `from db import ensure_pool`, replace all `pool = get_pool()` calls (3 occurrences) with `pool = await ensure_pool()`
- [X] T009 [P] [US1] Update `backend/services/personalization_service.py`: change `from db import get_pool` to `from db import ensure_pool`, replace `pool = get_pool()` call (1 occurrence) with `pool = await ensure_pool()`

### Test Updates for User Story 1

- [X] T010 [P] [US1] Update `backend/tests/test_chat_history.py`: change all `@patch("services.chat_history_service.get_pool")` to `@patch("services.chat_history_service.ensure_pool")` and update mock parameter names (10 patches); ensure mocked `ensure_pool` is an `AsyncMock` returning the mock pool
- [X] T011 [P] [US1] Update `backend/tests/test_cache_service.py`: change all `@patch("services.cache_service.get_pool")` to `@patch("services.cache_service.ensure_pool")` and update mock parameter names (7 patches); ensure mocked `ensure_pool` is an `AsyncMock` returning the mock pool
- [X] T012 [P] [US1] Update `backend/tests/test_personalization_service.py`: change all `patch("services.personalization_service.get_pool", ...)` to `patch("services.personalization_service.ensure_pool", ...)` (3 patches); ensure mocked `ensure_pool` is an `AsyncMock` returning the mock pool

**Checkpoint**: User Story 1 complete — chatbot service chain (`chat_history_service`, `cache_service`, `personalization_service`) uses lazy pool. Run `pytest backend/tests/test_chat_history.py backend/tests/test_cache_service.py backend/tests/test_personalization_service.py` to verify.

---

## Phase 4: User Story 2 — Authentication Works Cross-Origin (Priority: P1)

**Goal**: Signup/signin on GitHub Pages sets JWT cookies via Railway backend with correct cross-origin attributes (`SameSite=None; Secure; HttpOnly`).

**Independent Test**: Sign up with new email from GitHub Pages, verify `/api/auth/me` returns user data on subsequent page loads.

**Relevant FRs**: FR-002, FR-004, FR-007, FR-010

### Caller Updates for User Story 2

- [X] T013 [US2] Update `backend/routes/auth.py`: change `from db import get_pool` to `from db import ensure_pool`, replace all `pool = get_pool()` calls (4 occurrences) with `pool = await ensure_pool()`

### Test Updates for User Story 2

- [X] T014 [P] [US2] Update `backend/tests/test_auth_api.py`: change all `@patch("routes.auth.get_pool")` to `@patch("routes.auth.ensure_pool")` and update mock parameter names (12 patches); ensure mocked `ensure_pool` is an `AsyncMock` returning the mock pool
- [X] T015 [P] [US2] Update `backend/tests/test_auth_cache.py`: change all `@patch("routes.auth.get_pool")` to `@patch("routes.auth.ensure_pool")` and update mock parameter names (2 patches); ensure mocked `ensure_pool` is an `AsyncMock` returning the mock pool

**Checkpoint**: User Story 2 complete — auth routes use lazy pool, cookie config already correct when `APP_ENV=production`. Run `pytest backend/tests/test_auth_api.py backend/tests/test_auth_cache.py` to verify.

---

## Phase 5: User Story 3 — Railway Deploys Reliably on Push to Main (Priority: P2)

**Goal**: Only backend-relevant pushes trigger Railway builds. Builds succeed, migrations run, healthcheck passes.

**Independent Test**: Push a backend-only change to `main`, verify Railway builds and healthcheck passes within 5 minutes.

**Relevant FRs**: FR-001, FR-005, FR-006

> **Note**: All code tasks for this story were already completed in Phase 1 (T001 `railway.json`, T002 `migrate.py`). This phase validates the integration.

- [X] T016 [US3] Validate `railway.json` matches contracts/railway-config.md schema: verify `watchPatterns`, `healthcheckPath`, `healthcheckTimeout`, `sleepApplication`, and `startCommand` with `migrate.py &&` prefix are all present and correct

**Checkpoint**: User Story 3 complete — `railway.json` is authoritative config-as-code. Reliable deploys depend on Railway dashboard env var changes documented in quickstart.md.

---

## Phase 6: User Story 4 — Local Development Still Works Seamlessly (Priority: P2)

**Goal**: Backend on `localhost:8000` + frontend on `localhost:3000` continues to work identically after all changes.

**Independent Test**: Run `pytest` in `backend/` — all 112 tests pass. Start backend locally, verify chatbot and auth work.

**Relevant FRs**: FR-008, FR-009

- [X] T017 [US4] Run full test suite `cd backend && python -m pytest tests/ -v` and verify all 112 tests pass after all `get_pool` → `ensure_pool` migrations
- [X] T018 [US4] Verify local startup: run `cd backend && uvicorn main:app --reload --port 8000` with `.env` — confirm no startup errors, `/health` returns 200, chatbot endpoint responds

**Checkpoint**: User Story 4 complete — local development unbroken, all tests green.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation

- [X] T019 [P] Document Railway dashboard changes in `DEPLOY.md` or `backend/README.md`: add section listing the 3 required manual changes (`APP_ENV=production`, remove `channel_binding=require` from `DATABASE_URL`, set `CORS_ORIGINS`)
- [X] T020 Run quickstart.md validation: follow deploy verification steps from `specs/010-fix-railway-deploy/quickstart.md` section 4 (healthcheck, CORS preflight, chat endpoint)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ─────────────────┐
  T001 (railway.json)           │
  T002 (migrate.py)      [P]   │
  T003 (test_migrate.py) [P]   │
                                ▼
Phase 2: Foundational ──────────┐
  T004 (db.py refactor)        │ ← BLOCKS all user stories
  T005 (main.py lifespan)      │ ← depends on T004
  T006 (main.py CORS)    [P]   │ ← independent of T004/T005
                                ▼
Phase 3: US1 (P1) ──────────── Phase 4: US2 (P1)
  T007-T012 [all P]             T013-T015
                    \          /
                     ▼        ▼
               Phase 5: US3 (P2) ── Phase 6: US4 (P2)
                 T016 (validate)     T017-T018 (test suite)
                          \          /
                           ▼        ▼
                    Phase 7: Polish
                      T019-T020
```

### User Story Dependencies

- **US1 (Chatbot)**: Depends on Phase 2 (db.py refactor). No dependency on other stories.
- **US2 (Auth)**: Depends on Phase 2 (db.py refactor). No dependency on other stories.
- **US3 (Reliable Deploy)**: Code done in Phase 1. Validation after all code changes.
- **US4 (Local Dev)**: Validation after all code changes. Tests must pass.

### Within Each User Story

- Caller updates (`get_pool` → `ensure_pool`) before test updates
- All caller updates within a story marked [P] can run in parallel
- All test updates within a story marked [P] can run in parallel

### Parallel Opportunities

- T001, T002, T003 can all run in parallel (Phase 1)
- T004 must complete before T005, but T006 can run in parallel with T004
- T007, T008, T009 can all run in parallel (US1 callers — different files)
- T010, T011, T012 can all run in parallel (US1 tests — different files)
- Phase 3 (US1) and Phase 4 (US2) can run in parallel after Phase 2

---

## Parallel Example: User Story 1

```bash
# Launch all US1 caller updates in parallel (different files):
T007: "Update chat_history_service.py: get_pool → ensure_pool"
T008: "Update cache_service.py: get_pool → ensure_pool"
T009: "Update personalization_service.py: get_pool → ensure_pool"

# Then launch all US1 test updates in parallel (different files):
T010: "Update test_chat_history.py: mock get_pool → ensure_pool"
T011: "Update test_cache_service.py: mock get_pool → ensure_pool"
T012: "Update test_personalization_service.py: mock get_pool → ensure_pool"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`railway.json`, `migrate.py`, `test_migrate.py`)
2. Complete Phase 2: Foundational (`db.py` refactor, `main.py` updates) — CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (chatbot service chain + tests)
4. **STOP and VALIDATE**: Run chatbot-related tests, verify locally
5. Deploy to Railway and test chatbot from GitHub Pages

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Add US1 (Phase 3) → Chatbot works → Deploy/Test (MVP!)
3. Add US2 (Phase 4) → Auth works cross-origin → Deploy/Test
4. Run US3 + US4 validation (Phase 5-6) → Reliable deploys confirmed
5. Polish (Phase 7) → Documentation complete

### Single Developer Sequence (Recommended)

```
T001 → T002 → T003 → T004 → T005 → T006 →
T007 → T008 → T009 → T010 → T011 → T012 →
T013 → T014 → T015 → T016 → T017 → T018 →
T019 → T020
```

Total: **20 tasks** across 7 phases covering 4 user stories.
