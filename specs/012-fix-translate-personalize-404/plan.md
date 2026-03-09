# Implementation Plan: Fix Translate & Personalize 404 Errors on Railway

**Branch**: `012-fix-translate-personalize-404` | **Date**: 2026-03-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-fix-translate-personalize-404/spec.md`

## Summary

The translate (`/api/translate`) and personalize (`/api/personalize`) endpoints return 404 on Railway because the `website/docs/` markdown files are not present in the Railway container. Railway deploys only the `backend/` subdirectory, but both endpoints resolve docs via `Path(__file__).parent.parent.parent / "website" / "docs"` — a path that traverses outside the container root.

**Fix**: Copy `website/docs/` into `backend/docs/` and update the two path-resolution constants to look for `backend/docs/` first (with fallback to `website/docs/` for local development).

## Technical Context

**Language/Version**: Python 3.13  
**Primary Dependencies**: FastAPI 0.115+, Pydantic, asyncpg, qdrant-client, google-generativeai  
**Storage**: Neon PostgreSQL (via asyncpg), Qdrant Cloud (vectors), filesystem (chapter markdown)  
**Testing**: pytest (119+ existing tests)  
**Target Platform**: Railway (Nixpacks + serverless), GitHub Pages (frontend)  
**Project Type**: Web service (FastAPI backend) + static site (Docusaurus frontend)  
**Performance Goals**: Endpoints respond in <5s p95 (AI latency-bound, not filesystem)  
**Constraints**: Railway container only includes files under the configured root directory (`backend/`)  
**Scale/Scope**: 18 markdown files (192KB), 2 Python files modified, 1 new test file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | MVP-First | ✅ PASS | Smallest viable fix — copy 18 files + update 2 path constants |
| II | No Auth/Personalization/Translation | ⚠️ N/A | Constitution was written for MVP phase; auth, personalization, and translation features were added post-MVP. This feature fixes their deployment, not adds new scope. |
| III | Content Scope | ✅ PASS | Not changing content; fixing access to existing content |
| IV | Chatbot Omnipresence | ✅ PASS | Chat endpoint unaffected (uses Qdrant, not local files) |
| V | Deployability & Demability | ✅ PASS | Fix ensures translate and personalize are demoable in production |
| VI | No Over-Engineering | ✅ PASS | Simple file copy + path update, no new services or infrastructure |

**Gate result**: PASS — all applicable principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/012-fix-translate-personalize-404/
├── plan.md              # This file
├── research.md          # Phase 0 output — root cause analysis & approach selection
├── data-model.md        # Phase 1 output — file inventory & path resolution changes
├── quickstart.md        # Phase 1 output — verification runbook
├── contracts/
│   └── api-contracts.md # Phase 1 output — unchanged API contracts for reference
├── checklists/
│   └── requirements.md  # Spec quality checklist (16/16 PASS)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (changes)

```text
backend/
├── docs/                     # NEW — copy of website/docs/ (18 markdown files)
│   ├── intro/
│   │   └── index.md
│   ├── module1-ros2/
│   │   ├── 01-architecture.md
│   │   ├── 02-nodes-topics-services.md
│   │   ├── 03-python-packages.md
│   │   ├── 04-launch-files.md
│   │   └── 05-urdf.md
│   ├── module2-simulation/
│   │   ├── chapter1-gazebo-basics.md
│   │   ├── chapter2-gazebo-ros2-integration.md
│   │   ├── chapter3-unity-robotics.md
│   │   └── chapter4-unity-ml-agents.md
│   ├── module3-isaac/
│   │   ├── chapter1-isaac-sim-intro.md
│   │   ├── chapter2-isaac-gym.md
│   │   ├── chapter3-isaac-ros2-bridge.md
│   │   └── chapter4-isaac-reinforcement-learning.md
│   └── module4-vla/
│       ├── chapter1-vla-intro.md
│       ├── chapter2-multimodal-models.md
│       ├── chapter3-action-chunking.md
│       └── chapter4-vla-robotics.md
├── routes/
│   └── translate.py          # MODIFIED — update _DOCS_DIR path resolution (line 54)
├── services/
│   └── personalization_service.py  # MODIFIED — update _DOCS_ROOT path resolution (line 86)
├── tests/
│   └── test_docs_available.py  # NEW — verify docs directory & file count
└── railway.json              # MODIFIED — add backend/docs/** to watchPatterns
```

**Structure Decision**: No structural changes. Files are added inside the existing `backend/` directory tree.

## Root Cause Analysis

```
                        Local Development                   Railway Production
                        ─────────────────                   ──────────────────
Repository Root:       /repo/                              /app/ (container)
Backend:               /repo/backend/                      /app/ (backend/ IS the root)
Docs (website):        /repo/website/docs/ ✅              NOT IN CONTAINER ❌

Path Resolution:
translate.py:          __file__ = /repo/backend/routes/translate.py
                       .parent.parent.parent = /repo/
                       + "website/docs" = /repo/website/docs/ ✅

On Railway:            __file__ = /app/routes/translate.py
                       .parent.parent.parent = / (filesystem root!)
                       + "website/docs" = /website/docs/ ❌ DOESN'T EXIST
```

**Fix**: Add `backend/docs/` so Railway has the files, and update path resolution to find them.

## Complexity Tracking

No constitution violations to justify. This is a minimally scoped fix.
