# Hack-I-Copilot Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-04

## Active Technologies
- Python 3.13 (backend), TypeScript 5.x (frontend) + FastAPI 0.115+, python-jose (JWT), bcrypt, asyncpg, Docusaurus 3.9.2, React 19 (003-fix-auth-cookie-persistence)
- Neon PostgreSQL (asyncpg), Qdrant Cloud (vector DB — unaffected by this change) (003-fix-auth-cookie-persistence)
- Python 3.13 (backend), TypeScript 5.x (frontend) + FastAPI 0.115+, python-jose (JWT HS256), bcrypt, asyncpg, Docusaurus 3.9.2, React 19 (003-fix-auth-cookie-persistence)
- Python 3.13 (backend), TypeScript/React 19 (frontend) + FastAPI, asyncpg, google-genai, qdrant-client, python-jose, bcrypt, groq, openai (004-physical-ai-textbook)
- Neon Serverless PostgreSQL (users, backgrounds, cache, chat_messages) + Qdrant Cloud (vectors) (004-physical-ai-textbook)
- Python 3.13 + FastAPI, OpenAI Agents SDK (`openai-agents`), `openai` (transitive), `qdrant-client` (005-openai-agents-gemini)
- Neon PostgreSQL (asyncpg), Qdrant Cloud (vectors) — both unchanged (005-openai-agents-gemini)
- TypeScript 5.x, React 19, CSS3 + Docusaurus 3.9, Infima CSS framework (bundled), clsx — all already installed (006-ui-redesign)
- N/A — frontend-only (006-ui-redesign)
- TypeScript (React 19 JSX), CSS (global + CSS modules), Docusaurus 3.9 + `@docusaurus/core` classic preset, Infima theme tokens, React runtime, existing local components only (no new packages) (007-ui-v2-premium)
- N/A (no data model or persistence changes for this feature) (007-ui-v2-premium)
- CSS3 (within Docusaurus 3.9 / React 19 project) + Docusaurus CSS custom styles (`website/src/css/auth-modal.css`) (008-fix-auth-modal-overflow)
- TypeScript 5.6, React 19, Node.js 18+ + Docusaurus 3.9.2, Playwright (new — `@playwright/test`), React 19 (009-playwright-e2e-testing)
- N/A (frontend-only changes + E2E tests) (009-playwright-e2e-testing)
- Python 3.13 (Nixpacks auto-detected from `runtime.txt`) + FastAPI 0.135+, uvicorn, asyncpg, openai-agents, qdrant-client, python-jose, bcrypt (010-fix-railway-deploy)
- Neon Postgres (asyncpg pool, `sslmode=require`), Qdrant Cloud (vector DB) (010-fix-railway-deploy)
- Python 3.13 (backend), TypeScript/Node 20 (frontend build) + FastAPI 0.115+, uvicorn, asyncpg, Docusaurus 3.9 (011-fix-deployment-connectivity)
- Neon PostgreSQL (via `DATABASE_URL`), Qdrant Cloud (vector store) (011-fix-deployment-connectivity)
- Python 3.13 + FastAPI 0.115+, Pydantic, asyncpg, qdrant-client, google-generativeai (012-fix-translate-personalize-404)
- Neon PostgreSQL (via asyncpg), Qdrant Cloud (vectors), filesystem (chapter markdown) (012-fix-translate-personalize-404)
- Python 3.13.2 (backend), TypeScript/React 19 (frontend) + FastAPI 0.115.12, OpenAI Agents SDK, Docusaurus 3.9.2, asyncpg (013-fix-chatbot-selection)
- Neon PostgreSQL (asyncpg, pool 2–10), Qdrant vector DB (3072-dim Gemini embeddings) (013-fix-chatbot-selection)

- Python 3.12+ (backend, uv), TypeScript/React 19 (frontend, Docusaurus 3.9.2) + FastAPI, google-genai (gemini-2.5-flash, gemini-embedding-001), qdrant-client, asyncpg, python-jose[cryptography], passlib[bcrypt], custom AuthProvider.tsx (frontend) (002-mvp2-complete-textbook)

## Project Structure

```text
backend/          # FastAPI backend (Python, uv)
website/          # Docusaurus 3.9.2 frontend (TypeScript, React 19)
specs/            # Feature specs, plans, contracts
.specify/         # SpecKit Plus templates and scripts
```

## Commands

```bash
# Backend
cd backend && uv sync && uv run uvicorn main:app --reload
cd backend && uv run pytest -v

# Frontend
cd website && npm install && npm start
cd website && npm run build
```

## Code Style

- Python: type hints required, async/await for I/O, ruff for linting
- TypeScript: strict mode, React functional components with hooks

## Recent Changes
- 013-fix-chatbot-selection: Added Python 3.13.2 (backend), TypeScript/React 19 (frontend) + FastAPI 0.115.12, OpenAI Agents SDK, Docusaurus 3.9.2, asyncpg
- 012-fix-translate-personalize-404: Added Python 3.13 + FastAPI 0.115+, Pydantic, asyncpg, qdrant-client, google-generativeai
- 011-fix-deployment-connectivity: Added Python 3.13 (backend), TypeScript/Node 20 (frontend build) + FastAPI 0.115+, uvicorn, asyncpg, Docusaurus 3.9


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
