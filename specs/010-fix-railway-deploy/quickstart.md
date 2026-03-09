# Quickstart: Deploying Physical AI Textbook (Railway + GitHub Pages)

**Feature**: `010-fix-railway-deploy` | **Date**: 2026-03-09

## Prerequisites

- GitHub repository with `main` branch
- Railway account connected to the GitHub repo
- Neon Postgres database provisioned
- Qdrant Cloud cluster provisioned
- Google Gemini API key

## 1. Railway Dashboard Configuration

### Environment Variables (Set in Railway → Variables)

| Variable | Value | Action |
|----------|-------|--------|
| `APP_ENV` | `production` | **SET** (was `development`) |
| `CORS_ORIGINS` | `https://abdullahzunorain.github.io` | **SET** (production frontend only) |
| `DATABASE_URL` | Neon connection string | **VERIFY**: Remove `channel_binding=require` if present |
| `GOOGLE_API_KEY` | Your Gemini API key | Verify set |
| `QDRANT_URL` | Qdrant Cloud URL | Verify set |
| `QDRANT_API_KEY` | Qdrant Cloud API key | Verify set |
| `JWT_SECRET` | Strong random string | Verify set |

### Railway Service Settings

- **Root Directory**: `backend`
- **Builder**: NIXPACKS (auto-detected from `railway.json`)
- **Branch**: `main`
- **Region**: Your preferred region

> **Note**: `railway.json` is now the source of truth for build/deploy config. Dashboard settings for healthcheck, sleep, watch paths, and start command are overridden by `railway.json`.

## 2. Required Code Changes (This Feature)

After implementing the tasks from `tasks.md`:

### Files Modified
- `backend/railway.json` — Full config-as-code (healthcheck, watch paths, sleep, migrations in start command)
- `backend/main.py` — CORS `allow_headers` expanded; eager DB init removed from lifespan
- `backend/db.py` — Lazy `ensure_pool()` replaces `init_pool()` + `get_pool()`

### Files Created
- `backend/migrate.py` — Python migration runner using asyncpg
- `backend/tests/test_migrate.py` — Tests for migration runner

## 3. Deploy Workflow

1. **Push to `main`**: Railway auto-builds when `backend/**` files change.
2. **Build**: Nixpacks installs Python 3.13 + `requirements.txt` dependencies.
3. **Start**: Railway runs `python migrate.py && uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. **Migrations**: `migrate.py` executes all SQL files in `backend/migrations/` (idempotent).
5. **Health Check**: Railway polls `GET /health` — expects HTTP 200 within 120s.
6. **Ready**: Service accepts traffic. Sleeps after ~15 min inactivity.

## 4. Verify Deployment

```bash
# 1. Health check
curl https://<your-app>.up.railway.app/health
# Expected: {"status": "ok"}

# 2. CORS preflight
curl -X OPTIONS https://<your-app>.up.railway.app/api/chat \
  -H "Origin: https://abdullahzunorain.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | grep -i "access-control"
# Expected: access-control-allow-origin: https://abdullahzunorain.github.io
#           access-control-allow-credentials: true

# 3. Chat endpoint
curl -X POST https://<your-app>.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is ROS 2?"}'
# Expected: JSON with "answer" and "sources" fields
```

## 5. Local Development (Unchanged)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Fill in DATABASE_URL, GOOGLE_API_KEY, etc.
uvicorn main:app --reload --port 8000
```

In another terminal:
```bash
cd website
npm install
npm start  # Opens http://localhost:3000
```

Local defaults: `APP_ENV=development`, CORS allows `localhost:3000,3001`, cookies use `SameSite=Lax`.

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Chatbot doesn't respond on GitHub Pages | CORS_ORIGINS missing or wrong | Set `CORS_ORIGINS=https://abdullahzunorain.github.io` in Railway |
| Auth cookies not persisting cross-origin | `APP_ENV=development` on Railway | Set `APP_ENV=production` in Railway |
| Deploy fails with migration error | `channel_binding=require` in DATABASE_URL | Remove it from Railway env var |
| Non-backend commits trigger builds | Missing `watchPatterns` in railway.json | Ensure `railway.json` has `"watchPatterns": ["backend/**"]` |
| DB errors after Railway wake | Stale pool from eager init | Verify `ensure_pool()` pattern in `db.py` (lazy init) |
