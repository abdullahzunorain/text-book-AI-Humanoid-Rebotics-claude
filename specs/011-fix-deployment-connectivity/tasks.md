# Tasks: Fix Deployment Connectivity

**Input**: Design documents from `/specs/011-fix-deployment-connectivity/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: No automated tests requested — this feature is configuration/operations only. Validation is via curl commands and browser verification per quickstart.md.

**Organization**: Tasks grouped by user story. US1 and US2 are tightly coupled (env vars may cause the healthcheck failure), so US2 is executed first.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/systems, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths or dashboard locations in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify current state and ensure tooling is ready

- [x] T001 Verify GitHub CLI is authenticated and has repo access — run `gh auth status` and `gh variable list`
- [x] T002 [P] Verify curl is available and backend root responds — run `curl -sS https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/`
- [x] T003 [P] Verify current branch is `011-fix-deployment-connectivity` — run `git branch --show-current`

**Checkpoint**: Tooling confirmed — can proceed to env var configuration

---

## Phase 2: User Story 2 — Railway Environment Variables Are Complete (Priority: P1)

**Goal**: Set all 7 required environment variables in Railway dashboard so the backend can connect to all external services.

**Independent Test**: All env vars present in Railway Variables tab; backend endpoints return valid responses (not 500s from missing config).

**Why US2 before US1**: Missing env vars (especially `DATABASE_URL`) may be the root cause of the 502 on `/health` — `migrate.py` could hang on DNS resolution for an empty connection string before uvicorn starts. Fixing env vars first eliminates this possibility.

### Implementation

- [x] T004 [US2] Set `DATABASE_URL` in Railway Variables — value: Neon PostgreSQL connection string (must include `?sslmode=require`)
- [x] T005 [P] [US2] Set `JWT_SECRET` in Railway Variables — value: random string, 32+ characters
- [x] T006 [P] [US2] Set `GOOGLE_API_KEY` in Railway Variables — value: valid Google AI API key for Gemini
- [x] T007 [P] [US2] Set `QDRANT_URL` in Railway Variables — value: Qdrant Cloud cluster URL (e.g., `https://xxx.qdrant.io`)
- [x] T008 [P] [US2] Set `QDRANT_API_KEY` in Railway Variables — value: Qdrant Cloud API key
- [x] T009 [P] [US2] Set `APP_ENV` in Railway Variables — value: exactly `production` (case-sensitive)
- [x] T010 [US2] Set `CORS_ORIGINS` in Railway Variables — value: `https://abdullahzunorain.github.io` (no trailing slash, exact origin)
- [x] T011 [US2] Verify all 7 variables are present and non-empty in Railway Variables tab — screenshot or list confirmation
- [x] T012 [US2] Trigger Railway redeploy after env var changes — Railway should auto-redeploy, but verify via Deployments tab

**Checkpoint**: All 7 Railway env vars set. Backend will redeploy with correct configuration. Satisfies FR-002, FR-003, FR-004.

---

## Phase 3: User Story 1 — Backend Health Check Responds Successfully (Priority: P1)

**Goal**: Confirm `/health` returns HTTP 200 after env vars are set and Railway redeploys.

**Independent Test**: `curl https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/health` returns `{"status":"ok"}` with HTTP 200.

### Implementation

- [x] T013 [US1] Wait for Railway redeploy to complete — check Deployments tab shows "Active" status with latest deploy
- [x] T014 [US1] Test backend health endpoint — run `curl -sS --max-time 30 https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/health` and verify HTTP 200 with `{"status":"ok"}`
- [x] T015 [US1] Test backend root endpoint — run `curl -sS --max-time 30 https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/` and verify API info JSON response
- [x] T016 [US1] If `/health` still returns 502: check Railway deployment logs for startup errors — look for `migrate.py` failures or import errors
- [x] T017 [US1] If `/health` still returns 502 after logs are clean: test cold-start by waiting 10+ minutes (serverless sleep), then retry — if 502 on first request but 200 on second, this confirms cold-start timing; consider increasing `healthcheckTimeout` in backend/railway.json

**Checkpoint**: Backend `/health` responds with 200. Railway marks service as healthy. Satisfies FR-001, SC-001, SC-002.

---

## Phase 4: User Story 3 — Frontend Deployed with Correct API_URL (Priority: P1)

**Goal**: Trigger GitHub Actions workflow to rebuild and deploy the frontend with the Railway backend URL baked in.

**Independent Test**: Visit GitHub Pages site, open DevTools Network tab, trigger a chat interaction — requests target Railway backend (not localhost).

### Implementation

- [x] T018 [US3] Verify GitHub Actions `API_URL` variable is correct — run `gh variable list` and confirm value is `https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app` (no trailing slash)
- [x] T019 [US3] Trigger frontend redeploy — run `gh workflow run deploy.yml` to manually dispatch the GitHub Actions workflow
- [x] T020 [US3] Wait for workflow to complete — run `gh run list --workflow=deploy.yml --limit=1` and verify status is "completed" with success
- [x] T021 [US3] Verify deployed frontend has correct API URL — visit `https://abdullahzunorain.github.io/text-book-AI-Humanoid-Rebotics-CLAUDE/`, open DevTools Sources, search JS bundles for `text-book-ai-humanoid-rebotics-claude-production.up.railway.app` (should appear) and `localhost:8000` (should NOT appear)

**Checkpoint**: Frontend redeployed with Railway backend URL. All API calls target Railway. Satisfies FR-005, FR-006, SC-003.

---

## Phase 5: User Story 4 — End-to-End Cross-Origin Flow Works (Priority: P2)

**Goal**: Verify the complete user flow works across GitHub Pages frontend and Railway backend.

**Independent Test**: Open GitHub Pages site → sign up → chat → translate → refresh → verify session persists.

### Implementation

- [x] T022 [US4] Test CORS preflight — run `curl -sS -X OPTIONS -H "Origin: https://abdullahzunorain.github.io" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -v https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/api/chat 2>&1 | grep -i "access-control"` and verify `Access-Control-Allow-Origin: https://abdullahzunorain.github.io` and `Access-Control-Allow-Credentials: true`
- [x] T023 [US4] Test chat endpoint — run `curl -sS -X POST -H "Content-Type: application/json" -H "Origin: https://abdullahzunorain.github.io" -d '{"question":"What is ROS 2?"}' https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/api/chat` and verify JSON response with `answer` field
- [x] T024 [US4] Test auth signup endpoint — run `curl -sS -X POST -H "Content-Type: application/json" -H "Origin: https://abdullahzunorain.github.io" -d '{"email":"test@example.com","password":"TestPass123!"}' -v https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/api/auth/signup 2>&1 | grep -i "set-cookie"` and verify `Set-Cookie` header includes `SameSite=None; Secure`
- [x] T025 [US4] Browser end-to-end: open `https://abdullahzunorain.github.io/text-book-AI-Humanoid-Rebotics-CLAUDE/` in browser — verify page loads without errors
- [x] T026 [US4] Browser end-to-end: open chatbot widget → type "What is ROS 2?" → verify AI response appears in chat
- [x] T027 [US4] Browser end-to-end: open DevTools Console → verify zero CORS errors during chat interaction
- [x] T028 [US4] Browser end-to-end: sign up with test credentials → verify success message
- [x] T029 [US4] Browser end-to-end: refresh page → verify session persists (still signed in)

**Checkpoint**: Full user flow works cross-origin. Auth cookies persist. Zero CORS errors. Satisfies FR-007, FR-008, SC-004, SC-005, SC-006.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T030 Run existing backend test suite — `cd backend && python -m pytest tests/ -v` — verify all 119 tests still pass (no regressions from zero code changes)
- [x] T031 [P] Run quickstart.md verification runbook end-to-end — follow all 6 steps in specs/011-fix-deployment-connectivity/quickstart.md
- [x] T032 Update spec.md status from "Draft" to "Complete" in specs/011-fix-deployment-connectivity/spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ─────────────────────────────────────────┐
    │                                                    │
    ▼                                                    │
Phase 2: US2 — Railway Env Vars (P1) ──────────────────┐│
    │                                                   ││
    ▼                                                   ││
Phase 3: US1 — Health Check (P1)  ◄─── depends on US2  ││
    │                                                   ││
    ▼                                                   ││
Phase 4: US3 — Frontend Redeploy (P1) ◄── independent  ││
    │                                    (can run after ││
    │                                     Phase 1)      ││
    ▼                                                   ▼▼
Phase 5: US4 — E2E Verification (P2) ◄── depends on US1+US2+US3
    │
    ▼
Phase 6: Polish ◄── depends on all stories
```

### User Story Dependencies

- **US2 (Env Vars)**: Can start after Phase 1 — no dependencies on other stories. **Must complete before US1.**
- **US1 (Health Check)**: Depends on US2 completion (env vars may fix the 502)
- **US3 (Frontend Redeploy)**: Can start after Phase 1 — independent of US1/US2 (GitHub Actions is separate from Railway)
- **US4 (E2E Verification)**: Depends on US1 + US2 + US3 all complete

### Parallel Opportunities

- T005–T009 can all run in parallel (independent Railway env vars in different dashboard fields)
- US3 (frontend redeploy) can run in parallel with US2 (Railway env vars) — they operate on different systems
- T025–T029 are sequential browser verification steps that must run in order

### Within Each User Story

- Railway env var tasks (T004–T010) marked [P] can be set in parallel in the dashboard
- Verification tasks within each story are sequential (set → redeploy → test)

---

## Parallel Example: Phase 2 (Railway Env Vars)

```
# These can be set simultaneously in Railway Variables tab:
T005: Set JWT_SECRET        ──┐
T006: Set GOOGLE_API_KEY    ──┤
T007: Set QDRANT_URL        ──┼── All independent, set in parallel
T008: Set QDRANT_API_KEY    ──┤
T009: Set APP_ENV           ──┘

# Then sequentially:
T004: Set DATABASE_URL (first — may affect migrate.py)
T010: Set CORS_ORIGINS (last — easy to verify format)
T011: Verify all 7 present
T012: Trigger redeploy
```

---

## Implementation Strategy

### MVP First (US2 + US1 Only)

1. Complete Phase 1: Setup (verify tooling)
2. Complete Phase 2: US2 — Set all Railway env vars
3. Complete Phase 3: US1 — Verify health check passes
4. **STOP and VALIDATE**: Backend is healthy and configured
5. If time permits, proceed to US3 (frontend) and US4 (e2e)

### Full Delivery

1. Phases 1–3: Backend healthy with all env vars ← **This is the critical path**
2. Phase 4: Frontend redeployed (can overlap with Phase 2/3)
3. Phase 5: End-to-end verification
4. Phase 6: Polish and test suite validation

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 32 |
| Phase 1 (Setup) | 3 tasks |
| Phase 2 (US2 — Env Vars) | 9 tasks |
| Phase 3 (US1 — Health) | 5 tasks |
| Phase 4 (US3 — Frontend) | 4 tasks |
| Phase 5 (US4 — E2E) | 8 tasks |
| Phase 6 (Polish) | 3 tasks |
| Parallel opportunities | T002/T003, T005–T009, US3 parallel with US2 |
| MVP scope | US2 + US1 (14 tasks) |
| Code changes expected | 0 (configuration only) |
