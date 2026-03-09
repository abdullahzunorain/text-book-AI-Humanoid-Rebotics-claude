# Feature Specification: Fix Railway Backend Deployment for GitHub Pages + Railway Architecture

**Feature Branch**: `010-fix-railway-deploy`  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: User description: "Fix Railway backend deployment configuration for GitHub Pages (frontend) + Railway (backend) architecture. Backend deploys inconsistently on Railway — sometimes fails, sometimes deploys but chatbot doesn't work. Local deployment works perfectly."

## Problem Analysis

The application uses a **split-deployment architecture**:
- **Frontend**: Docusaurus static site hosted on **GitHub Pages** at `https://abdullahzunorain.github.io/text-book-AI-Humanoid-Rebotics-CLAUDE/`
- **Backend**: FastAPI API deployed on **Railway** at `https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app`

**Current symptoms**:
1. Railway deployments sometimes **fail** (latest "skills we added to .github" commit failed)
2. When deployment succeeds, the **chatbot doesn't work** (API calls from frontend to backend fail silently)
3. Local development works perfectly with both services running

**Root causes identified** (from codebase and Railway logs analysis):

| # | Issue | Impact | Severity |
|---|-------|--------|----------|
| 1 | `APP_ENV=development` in Railway env vars | Cookie config logs warnings; signals non-production mode | Medium |
| 2 | `railway.json` missing `healthcheckPath`, `sleepApplication` settings (diverged from Railway UI config) | Config-as-code doesn't match Railway dashboard; builds use stale config | High |
| 3 | `sleepApplication: true` (serverless) causes cold-start delays + DB connection drops | First request after sleep may timeout; TCP_OVERWINDOW errors on Neon DB reconnection — mitigated by lazy DB pool init on first request | High |
| 4 | CORS `allow_headers` only includes `"Content-Type"` — missing `"Authorization"` | Preflight requests may block future auth-header-based flows | Low |
| 5 | No `channel_binding` handling in `db.py` — DATABASE_URL has `channel_binding=require` which asyncpg may not support cleanly | Potential SSL handshake failures on connection init | High |
| 6 | Non-backend commits (e.g. `.github/` folders) trigger Railway builds unnecessarily | Wasted build minutes; failed builds clutter deploy history | Medium |
| 7 | Pre-deploy migration command uses `psql` which is not installed in the Nixpacks container | Migrations silently fail or block deployment | High |
| 8 | `runtime.txt` specifies `python-3.13.2` but Nixpacks auto-detects `python313` — no explicit pinning in `railway.json` | Python version drift across deploys | Low |

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Chatbot Works End-to-End After Railway Deploy (Priority: P1)

A student visits the GitHub Pages textbook site, opens the AI chatbot widget, types a question about ROS 2, and receives an accurate RAG-powered answer within seconds — even if the Railway backend was sleeping.

**Why this priority**: This is the core feature. If the chatbot doesn't respond, the entire AI-powered textbook value proposition fails.

**Independent Test**: Open https://abdullahzunorain.github.io/text-book-AI-Humanoid-Rebotics-CLAUDE/, open chatbot, type "What is ROS 2?", verify a response appears within 30 seconds (including cold-start wake-up time).

**Acceptance Scenarios**:

1. **Given** the Railway backend is deployed and healthy, **When** an unauthenticated user sends a chat message from GitHub Pages, **Then** the backend returns a JSON response with `answer` and `sources` fields, and the chatbot displays the answer.
2. **Given** the Railway backend is sleeping (serverless mode), **When** a user sends the first chat request, **Then** the backend wakes up, processes the request, and returns a response within 60 seconds (cold start budget).
3. **Given** the Qdrant vector DB and Google Gemini API are accessible, **When** the backend receives a question, **Then** it embeds the question, retrieves relevant chunks, generates an answer, and returns it with sources.

---

### User Story 2 — Authentication Works Cross-Origin (Priority: P1)

A student signs up or signs in on the GitHub Pages site. The JWT cookie is set by the Railway backend and persisted across page navigations so the student stays logged in.

**Why this priority**: Authentication gates translation, personalization, and chat history — three of the four AI features.

**Independent Test**: Sign up with a new email from GitHub Pages, verify the `/api/auth/me` call returns user data on subsequent page loads.

**Acceptance Scenarios**:

1. **Given** the frontend is on `https://abdullahzunorain.github.io` and backend on `https://...railway.app`, **When** a user signs up, **Then** the backend sets a cookie with `SameSite=None; Secure; HttpOnly` attributes that the browser accepts cross-origin.
2. **Given** a signed-in user navigates to a new textbook page, **When** the AuthProvider calls `/api/auth/me` with `credentials: 'include'`, **Then** the cookie is sent and the backend returns the user profile.
3. **Given** a user signs out, **When** the signout endpoint is called, **Then** the cookie is cleared with matching attributes.

---

### User Story 3 — Railway Deploys Reliably on Push to Main (Priority: P2)

A developer pushes changes to the `main` branch on GitHub. Only backend-relevant changes trigger a Railway deploy. The deploy succeeds, passes healthcheck, and the service is ready to serve traffic.

**Why this priority**: Without reliable deployments, no fixes can reach production.

**Independent Test**: Push a backend-only change to `main`, verify Railway builds, deploys, and healthcheck passes without errors.

**Acceptance Scenarios**:

1. **Given** a push to `main` modifies files only under `backend/`, **When** Railway triggers a build, **Then** the build succeeds with Nixpacks, installs dependencies, and starts the server.
2. **Given** a push to `main` modifies files only outside `backend/` (e.g. `.github/`, `website/`), **When** Railway evaluates the push, **Then** no build is triggered (using watch paths).
3. **Given** a successful build, **When** Railway runs the healthcheck on `/health`, **Then** it receives HTTP 200 within the timeout window and marks the deployment as successful.

---

### User Story 4 — Local Development Still Works Seamlessly (Priority: P2)

A developer clones the repo, runs `backend/` with a virtualenv and `website/` with npm, and everything works on `localhost` exactly as before — no environment configuration changes break local dev.

**Why this priority**: Cannot break the local development loop that currently works.

**Independent Test**: Run backend on port 8000 and frontend on port 3000 locally, verify chatbot, auth, translation, and personalization all work.

**Acceptance Scenarios**:

1. **Given** `APP_ENV` is unset or set to `development`, **When** the backend starts locally, **Then** CORS allows `http://localhost:3000` and cookies use `SameSite=Lax; Secure=false`.
2. **Given** `DATABASE_URL` is set in `.env`, **When** the backend starts, **Then** it connects to Neon DB with SSL and all auth/cache/history features work.
3. **Given** no environment changes, **When** existing tests are run, **Then** all 112 tests pass.

### Edge Cases

- What happens when Railway wakes from sleep but Neon DB connection fails? The backend should still serve the healthcheck and unauthenticated chat (with graceful DB error handling already in `lifespan`).
- What happens when `DATABASE_URL` contains `channel_binding=require`? This parameter must be removed from the Railway dashboard env var; asyncpg does not support it and will fail on connection init.
- What happens when the Google API key is rate-limited? The backend returns HTTP 429 with a `Retry-After` header (already implemented).
- What happens when a non-backend commit triggers a Railway build? With watch paths configured, the build should be skipped entirely.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `railway.json` config file MUST be updated to match the full Railway dashboard config, including `healthcheckPath`, `buildCommand`, and watch paths for `backend/**`
- **FR-002**: Railway environment variable `APP_ENV` MUST be set to `production` (documented as required change in Railway dashboard)
- **FR-003**: The `channel_binding=require` parameter MUST be removed from the `DATABASE_URL` in the Railway dashboard, since asyncpg does not support it natively — no backend code change required
- **FR-004**: The CORS middleware MUST allow headers needed for cross-origin requests: at minimum `Content-Type` and `Authorization`
- **FR-005**: The `railway.json` MUST include watch paths (`backend/**`) so non-backend commits do not trigger builds
- **FR-006**: The pre-deploy migration command MUST be replaced with a Python-based migration runner using asyncpg that auto-runs migrations on every deploy at startup (removing the `psql` dependency from the Railway container)
- **FR-007**: The `cookie_config.py` MUST produce `Secure=True; SameSite=None` when `APP_ENV=production` OR when HTTPS origins are detected (already implemented — just needs correct `APP_ENV`)
- **FR-008**: The backend MUST continue working identically on local development (`APP_ENV=development`, `http://localhost:3000/3001` CORS origins, `SameSite=Lax` cookies)
- **FR-009**: All 112 existing backend tests MUST continue to pass after changes
- **FR-010**: The DB connection pool MUST use lazy on-first-request initialization so that after Railway wake-from-sleep, a fresh pool is created on the first DB-dependent request rather than during lifespan startup (healthcheck `/health` must NOT require DB)

### Key Entities

- **Railway Configuration** (`railway.json`): Build settings, deploy command, healthcheck, watch paths, restart policy — the single source of truth for Railway deployments
- **Environment Variables**: The set of env vars required on Railway (`APP_ENV`, `CORS_ORIGINS`, `DATABASE_URL`, `GOOGLE_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `JWT_SECRET`)
- **Cookie Configuration**: Cross-origin cookie attributes derived from `APP_ENV` and `CORS_ORIGINS` — critical for auth to work across GitHub Pages and Railway domains

## Assumptions

- Railway's free plan supports the `watchPatterns` config-as-code field (or the UI "Watch Paths" equivalent)
- The Neon Postgres DATABASE_URL will continue to include `sslmode=require` (and possibly `channel_binding=require`)
- The Google API key, Qdrant credentials, and JWT secret are already correctly set in Railway environment variables
- Railway `CORS_ORIGINS` env var MUST contain only `https://abdullahzunorain.github.io` (no localhost entries) for production security; local developers use their own local backend
- GitHub Pages deployment is working correctly and only the Railway backend needs fixes
- The `sleepApplication` (serverless) setting will remain enabled due to the free plan — cold-start latency is accepted

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After pushing a backend change to `main`, Railway deployment succeeds within 5 minutes and healthcheck passes on first attempt
- **SC-002**: A user on GitHub Pages can send a chatbot question and receive a response within 60 seconds (including cold-start wake-up)
- **SC-003**: Cross-origin authentication (signup → signin → /me check) works end-to-end between GitHub Pages frontend and Railway backend
- **SC-004**: Non-backend commits to `main` do NOT trigger Railway builds
- **SC-005**: All 112 existing backend tests pass without modification
- **SC-006**: Local development workflow (backend on 8000, frontend on 3000) continues to work identically

## Clarifications

### Session 2026-03-09

- Q: How should `channel_binding=require` in DATABASE_URL be handled? → A: Manually remove it from the Railway dashboard DATABASE_URL (Option A — no code change needed)
- Q: How should pre-deploy migrations be handled without `psql` in the container? → A: Replace with a Python migration script using asyncpg that auto-runs at startup (Option B — auto-migrate every deploy)
- Q: How should DB reconnection after Railway wake-from-sleep be handled? → A: Move DB pool init to lazy on-first-request pattern so a fresh pool is created after each wake (Option B — no stale connections)
- Q: Should Railway CORS_ORIGINS include localhost for dev testing against production? → A: No — production only allows `https://abdullahzunorain.github.io`; local devs run their own backend (Option A — most secure)
