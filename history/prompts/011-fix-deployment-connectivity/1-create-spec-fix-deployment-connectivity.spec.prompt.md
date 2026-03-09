---
id: 1
title: Create Spec for Fix Deployment Connectivity
stage: spec
date: 2026-03-09
surface: agent
model: Claude Opus 4.6
feature: 011-fix-deployment-connectivity
branch: 011-fix-deployment-connectivity
user: zunorain
command: /speckit.specify
labels: ["deployment", "connectivity", "railway", "github-pages", "cors", "healthcheck"]
links:
  spec: specs/011-fix-deployment-connectivity/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/011-fix-deployment-connectivity/spec.md
  - specs/011-fix-deployment-connectivity/checklists/requirements.md
tests:
  - none
---

## Prompt

Create a new feature specification for issue 011: Fix Deployment Connectivity.

## Problem Context

The app has a Docusaurus frontend deployed on GitHub Pages at `https://abdullahzunorain.github.io/text-book-AI-Humanoid-Rebotics-CLAUDE/` and a FastAPI backend deployed on Railway at `https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app`.

After generating the Railway public domain and updating the GitHub Actions `API_URL` variable, we discovered:
- Backend root `/` responds with 200 OK (app IS running)
- Backend `/health` returns 502 ("Application failed to respond")
- Frontend has NOT been redeployed with the new `API_URL` pointing to Railway
- Railway environment variables may be incomplete (CORS_ORIGINS, DATABASE_URL, JWT_SECRET, GOOGLE_API_KEY, QDRANT_URL, QDRANT_API_KEY, APP_ENV)
- CORS_ORIGINS must include `https://abdullahzunorain.github.io` for cross-origin requests
- Cross-origin auth cookies require SameSite=None; Secure in production

## What Needs to Be Fixed

1. **Diagnose and fix /health 502**: The health endpoint code is just `return {"status": "ok"}` — so the 502 is likely a Railway-side issue (cold start timeout on serverless, or the healthcheck timeout is too short). Need to verify Railway deployment logs and possibly adjust healthcheck config.

2. **Verify Railway environment variables**: Ensure all required env vars are set in Railway dashboard:
   - `DATABASE_URL` (Neon PostgreSQL connection string)
   - `JWT_SECRET`
   - `GOOGLE_API_KEY` (for Gemini)
   - `QDRANT_URL` and `QDRANT_API_KEY` (for RAG vector store)
   - `APP_ENV=production`
   - `CORS_ORIGINS=https://abdullahzunorain.github.io`

3. **Trigger frontend redeploy**: The GitHub Actions workflow needs to rebuild the frontend with the updated `API_URL` variable so the Docusaurus site calls the Railway backend instead of localhost.

4. **End-to-end verification**: After fixes, verify the full flow — frontend loads, chatbot sends requests to Railway backend, auth works with cross-origin cookies.

## Technical Details

- Frontend: Docusaurus 3.9, deployed via GitHub Actions to GitHub Pages
- Backend: FastAPI, Python 3.13, deployed on Railway with Nixpacks
- `docusaurus.config.ts` line 33: `apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000'`
- `.github/workflows/deploy.yml` line 37: `REACT_APP_API_URL: ${{ vars.API_URL }}`
- `backend/railway.json`: healthcheckPath `/health`, healthcheckTimeout 120, serverless sleep enabled
- Backend uses lazy DB pool via `ensure_pool()` in `db.py`
- Auth uses httpOnly cookies with SameSite=None; Secure in production (controlled by APP_ENV)

## Constraints
- Must NOT change any existing backend code functionality
- Must NOT change any existing frontend page functionality
- Changes should be minimal — configuration and deployment fixes only
- The feature number is 011 and feature name should be `011-fix-deployment-connectivity`

## Response snapshot

Created feature branch `011-fix-deployment-connectivity` and wrote specification with 4 user stories (3x P1, 1x P2), 8 functional requirements, 6 success criteria, and a quality checklist. All checklist items pass — no [NEEDS CLARIFICATION] markers. Spec is ready for planning.

## Outcome

- ✅ Impact: Feature spec created covering health endpoint fix, env var verification, frontend redeploy, and E2E verification
- 🧪 Tests: No tests — this is a spec-phase artifact
- 📁 Files: spec.md, checklists/requirements.md
- 🔁 Next prompts: `/speckit.plan` to create architecture plan, or `/speckit.clarify` if questions arise
- 🧠 Reflection: No clarifications needed — the user provided comprehensive technical context with specific URLs, env vars, and file references

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Quality checklist — all items PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
