# Implementation Plan: Fix Railway Backend Deployment

**Branch**: `010-fix-railway-deploy` | **Date**: 2026-03-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-fix-railway-deploy/spec.md`

## Summary

Fix the Railway backend deployment so all frontend features (chatbot, auth, translation, personalization) work end-to-end between GitHub Pages and Railway. Root causes: `railway.json` config drift, `APP_ENV=development` in production, stale DB pool after serverless sleep, missing `psql` for migrations, and CORS header gaps. Fixes involve: updating `railway.json` to full config-as-code, lazy DB pool init, Python migration runner, CORS header expansion, and documented Railway dashboard changes.

## Technical Context

**Language/Version**: Python 3.13 (Nixpacks auto-detected from `runtime.txt`)
**Primary Dependencies**: FastAPI 0.135+, uvicorn, asyncpg, openai-agents, qdrant-client, python-jose, bcrypt
**Storage**: Neon Postgres (asyncpg pool, `sslmode=require`), Qdrant Cloud (vector DB)
**Testing**: pytest 9.x + pytest-asyncio (strict mode), 112 existing tests
**Target Platform**: Railway (Nixpacks container, serverless sleep), GitHub Pages (static frontend)
**Project Type**: Web service (FastAPI backend) + Static site (Docusaurus frontend)
**Performance Goals**: Chatbot response <60s including cold-start; healthcheck <1s
**Constraints**: Railway free plan (1 vCPU, 512MB RAM, serverless sleep enabled), cross-origin cookies (SameSite=None; Secure)
**Scale/Scope**: Single backend service, ~15 API endpoints, 4 AI-powered features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ PASS | Smallest viable diff — config fixes + 2 small code changes |
| II. No Auth scope | ✅ N/A | Auth already exists (post-MVP); this fix makes it work in production |
| III. Content Scope | ✅ N/A | No content changes |
| IV. Chatbot Omnipresence | ✅ PASS | Fix ensures chatbot works on deployed site |
| V. Deployability | ✅ PASS | Core goal: make Railway deployment reliable |
| VI. No Over-Engineering | ✅ PASS | No new services; migration runner is <40 lines |

**GATE RESULT**: ✅ All gates pass. Proceeding to Phase 0.

### Post-Design Re-Check (after Phase 1)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ PASS | 3 files modified, 2 created — minimal diff |
| II. No Auth scope | ✅ N/A | No new auth features; existing auth cookie config just needs correct env var |
| III. Content Scope | ✅ N/A | No content changes |
| IV. Chatbot Omnipresence | ✅ PASS | Lazy pool init + CORS fix ensures chatbot works on deployed site |
| V. Deployability | ✅ PASS | Config-as-code, Python migration runner, documented dashboard changes |
| VI. No Over-Engineering | ✅ PASS | migrate.py is ~35 lines; ensure_pool() is ~8 lines; no new services |

**POST-DESIGN GATE**: ✅ All gates pass. Ready for `/speckit.tasks`.

## Project Structure

### Documentation (this feature)

```text
specs/010-fix-railway-deploy/
├── plan.md              # This file
├── research.md          # Phase 0: Railway deployment research
├── data-model.md        # Phase 1: Migration data model
├── quickstart.md        # Phase 1: Deploy guide for Railway + GitHub Pages
├── contracts/           # Phase 1: Railway config contract
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files to modify)

```text
backend/
├── railway.json         # MODIFY: Full config-as-code (build, deploy, watch paths)
├── main.py              # MODIFY: CORS allow_headers, remove eager DB init from lifespan
├── db.py                # MODIFY: Lazy pool init + ensure_pool() helper
├── migrate.py           # CREATE: Python migration runner (~40 lines)
├── requirements.txt     # NO CHANGE
├── routes/              # NO CHANGE
├── services/            # NO CHANGE
└── tests/
    └── test_migrate.py  # CREATE: Migration runner tests
```

**Structure Decision**: Existing `backend/` structure retained. Only 3 files modified, 2 files created. No new directories or services.

## Complexity Tracking

No constitution violations. All changes are within the existing architecture.
