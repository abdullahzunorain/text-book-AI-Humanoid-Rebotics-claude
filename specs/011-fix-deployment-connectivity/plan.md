# Implementation Plan: Fix Deployment Connectivity

**Branch**: `011-fix-deployment-connectivity` | **Date**: 2026-03-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-fix-deployment-connectivity/spec.md`

## Summary

The backend is deployed on Railway and the root `/` endpoint responds, but `/health` returns 502. The frontend on GitHub Pages still points to `localhost:8000`. This plan addresses three configuration-level issues: (1) diagnose and fix the Railway healthcheck 502, (2) verify all Railway environment variables are set, and (3) trigger a frontend redeploy with the correct `API_URL`. No application code changes are required — this is purely deployment configuration.

## Technical Context

**Language/Version**: Python 3.13 (backend), TypeScript/Node 20 (frontend build)
**Primary Dependencies**: FastAPI 0.115+, uvicorn, asyncpg, Docusaurus 3.9
**Storage**: Neon PostgreSQL (via `DATABASE_URL`), Qdrant Cloud (vector store)
**Testing**: pytest (119 existing tests), curl (deployment verification)
**Target Platform**: Railway (backend), GitHub Pages (frontend static site)
**Project Type**: Web service (backend API) + static site (frontend)
**Performance Goals**: `/health` < 5s warm, < 120s cold start; pages < 3s load
**Constraints**: Zero code changes — configuration/deployment fixes only
**Scale/Scope**: Single Railway service, single GitHub Pages site

### Current Deployment Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────────────────────┐
│  GitHub Pages (frontend)    │  HTTPS  │  Railway (backend)                           │
│  abdullahzunorain.github.io │────────▶│  text-book-ai-humanoid-rebotics-claude-      │
│  /text-book-AI-Humanoid-... │         │  production.up.railway.app                   │
│                             │         │                                              │
│  Built by: GitHub Actions   │         │  Start: python migrate.py &&                 │
│  Env: REACT_APP_API_URL     │         │         uvicorn main:app --host 0.0.0.0      │
│       = ${{ vars.API_URL }} │         │         --port $PORT                         │
└─────────────────────────────┘         │                                              │
                                        │  Healthcheck: GET /health (120s timeout)     │
                                        │  Serverless: sleep enabled                   │
                                        │  Restart: ON_FAILURE (max 10)                │
                                        └──────────────────────────────────────────────┘
```

### Known State (from debugging sessions)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /` | ✅ 200 | Returns API info JSON — backend IS running |
| `GET /health` | ❌ 502 | "Application failed to respond" — healthcheck failing |
| Frontend | ❌ Stale | Still calls `localhost:8000` — needs redeploy |
| GitHub var `API_URL` | ✅ Set | Points to Railway domain |

### Root Cause Analysis

The `/health` endpoint code is trivial (`return {"status": "ok"}`) with zero dependencies — no DB, no external calls. The 502 is NOT a code bug. Likely causes:

1. **Startup command blocks on `migrate.py`**: Railway's start command is `python migrate.py && uvicorn main:app ...`. If `migrate.py` fails (e.g., missing `DATABASE_URL`), uvicorn never starts. Railway's healthcheck hits `/health` on a process that isn't listening yet → 502.
2. **Missing `DATABASE_URL` env var**: `migrate.py` calls `asyncpg.connect(dsn)` where `dsn` defaults to `os.getenv("DATABASE_URL")`. If not set, the migration either errors out or hangs on DNS resolution.
3. **Serverless cold start**: With `sleepApplication: true`, the first request after sleep triggers a full boot cycle (migrate + uvicorn startup). If Railway's internal routing timeout is shorter than the boot time, the first healthcheck returns 502.

**Most probable**: Cause #1/#2 — missing Railway env vars cause `migrate.py` to fail, preventing uvicorn from starting. The root `/` endpoint working was likely from a previous successful boot that's now cached/warm.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ PASS | Deployment connectivity is MVP-critical — can't demo without it |
| II. No Auth, No Personalization, No Translation | ✅ PASS | Not adding features; fixing deployment of existing ones |
| III. Content Scope | ✅ PASS | No content changes |
| IV. Chatbot Omnipresence | ✅ PASS | Fixing connectivity so chatbot works in production |
| V. Deployability & Demability | ✅ PASS | This IS the deployability fix |
| VI. No Over-Engineering | ✅ PASS | Configuration-only changes, zero code changes |
| Tech Stack | ✅ PASS | Using existing stack (FastAPI, Docusaurus, Railway, GitHub Pages) |
| No Hardcoded Secrets | ✅ PASS | All secrets via Railway env vars and GitHub Actions vars |

**GATE RESULT: ALL PASS** — proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/011-fix-deployment-connectivity/
├── plan.md              # This file
├── research.md          # Phase 0: root cause analysis and resolution
├── data-model.md        # Phase 1: environment variable inventory (no schema changes)
├── quickstart.md        # Phase 1: deployment verification runbook
├── contracts/           # Phase 1: cross-origin request/response contracts
└── tasks.md             # Phase 2: actionable task breakdown
```

### Source Code (repository root)

```text
backend/
├── main.py              # CORS config, /health endpoint — NO CHANGES expected
├── railway.json         # Healthcheck config — may adjust timeout if needed
├── cookie_config.py     # Cookie attrs — NO CHANGES (reads from env)
├── db.py                # Lazy pool — NO CHANGES (reads DATABASE_URL)
├── migrate.py           # Migration runner — NO CHANGES (reads DATABASE_URL)
└── requirements.txt     # Dependencies — NO CHANGES

website/
├── docusaurus.config.ts # apiUrl from REACT_APP_API_URL — NO CHANGES
└── src/components/      # Frontend components — NO CHANGES

.github/workflows/
└── deploy.yml           # Build with API_URL var — NO CHANGES (trigger only)
```

**Structure Decision**: No structural changes. All fixes are environment configuration (Railway dashboard) and deployment re-triggers (GitHub Actions). The only possible code-level change is to `railway.json` if healthcheck timeout needs adjustment.

## Complexity Tracking

> No violations. This feature is configuration-only with zero code changes.

## Constitution Check — Post-Design Re-evaluation

*Re-evaluated after Phase 1 design completion.*

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. MVP-First | ✅ PASS | Only deployment config changes — smallest possible diff |
| II. No Auth, No Personalization, No Translation | ✅ PASS | Not adding features — fixing deployment of existing stack |
| III. Content Scope | ✅ PASS | Zero content changes |
| IV. Chatbot Omnipresence | ✅ PASS | This fix enables the chatbot to work in production |
| V. Deployability & Demability | ✅ PASS | This IS the fix for deployability |
| VI. No Over-Engineering | ✅ PASS | Configuration-only: env vars + workflow trigger. No new services, frameworks, or abstractions |
| Tech Stack | ✅ PASS | Using existing stack unchanged |
| No Hardcoded Secrets | ✅ PASS | All secrets in Railway env vars / GitHub Actions vars |

**POST-DESIGN GATE RESULT: ALL PASS** — ready for Phase 2 (tasks).
