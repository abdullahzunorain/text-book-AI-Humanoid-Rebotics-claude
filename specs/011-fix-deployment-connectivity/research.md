# Research: Fix Deployment Connectivity

**Feature**: 011-fix-deployment-connectivity  
**Date**: 2026-03-09  
**Phase**: 0 — Outline & Research

## Research Task 1: Why does `/health` return 502 while `/` returns 200?

### Findings

**Code analysis**: The `/health` endpoint is trivial:
```python
@app.get("/health")
async def health():
    return {"status": "ok"}
```
It has zero external dependencies. If the app boots, `/health` will respond.

**The root `/` also responded**: During our debugging session, `curl /` returned the full API info JSON with HTTP 200. This proves uvicorn started successfully at that moment.

**Railway 502 meaning**: A Railway 502 means "the application process is not listening on the expected port." This is NOT an application error — it's Railway's reverse proxy saying "I tried to forward the request but nothing was there."

### Decision: The 502 is a serverless cold-start timing issue

**Rationale**: 
- Railway `sleepApplication: true` puts the service to sleep after inactivity
- On wake, Railway must: (1) spin up the container, (2) run `python migrate.py`, (3) start uvicorn
- The healthcheck fires on Railway's internal schedule — if it hits during boot, the app isn't listening yet → 502
- The `curl /` success was during a warm period (app already booted)
- The `curl /health` failure was likely after a sleep cycle or during a cold start

**Alternatives considered**:
1. ~~Missing env vars causing crash~~ — Rejected: `migrate.py` gracefully handles missing `DATABASE_URL` (returns []), `agent_config.py` logs warning for missing `GOOGLE_API_KEY`, and the import chain uses `os.getenv` with defaults throughout
2. ~~Code bug in /health~~ — Rejected: The endpoint is 2 lines with no logic
3. ~~Port mismatch~~ — Rejected: The `/$` endpoint works, so port binding is correct

**Resolution**: The current `healthcheckTimeout: 120` (120 seconds) should be sufficient for cold-start boot. The 502 was likely observed during a transient state. However, we should:
1. Verify Railway env vars are set (missing `DATABASE_URL` won't crash `migrate.py` but might cause slow DNS timeout before the graceful skip)
2. Re-test `/health` after ensuring env vars are correct
3. If still 502, consider if `migrate.py` hangs on DNS resolution for an empty connection string

## Research Task 2: Required Railway Environment Variables

### Findings

**Code scan results** — all env vars read from `os.getenv`:

| Variable | File | Default | Required? | Impact if Missing |
|----------|------|---------|-----------|-------------------|
| `DATABASE_URL` | `db.py:30`, `migrate.py:37` | `""` | Yes (for DB features) | `ensure_pool()` raises `ValueError`; `migrate.py` skips |
| `JWT_SECRET` | `auth_utils.py` | None | Yes (for auth) | Auth endpoints fail |
| `GOOGLE_API_KEY` | `services/agent_config.py:41` | `""` | Yes (for AI) | All agent/embedding calls fail |
| `QDRANT_URL` | `rag_service.py:16` | `""` | Yes (for RAG) | Vector search fails |
| `QDRANT_API_KEY` | `rag_service.py:17` | `""` | Yes (for RAG) | Qdrant auth fails |
| `APP_ENV` | `cookie_config.py:38` | `"development"` | Yes (for cookies) | Cookies use `Lax` instead of `None` → cross-origin auth fails |
| `CORS_ORIGINS` | `main.py:42` | `"localhost:3000,localhost:3001"` | Yes (for CORS) | Frontend requests blocked by CORS |
| `PORT` | `railway.json` start command | Railway auto-sets | Auto | Railway sets `$PORT` automatically |

### Decision: 7 env vars must be set in Railway dashboard

**Rationale**: Each variable controls a critical path. Without all 7, the app boots but features fail silently or with 500 errors.

**Required values**:
- `DATABASE_URL` = Neon PostgreSQL connection string (with `?sslmode=require`)
- `JWT_SECRET` = Random secret string (32+ chars)
- `GOOGLE_API_KEY` = Valid Google AI API key for Gemini
- `QDRANT_URL` = Qdrant Cloud cluster URL
- `QDRANT_API_KEY` = Qdrant Cloud API key
- `APP_ENV` = `production`
- `CORS_ORIGINS` = `https://abdullahzunorain.github.io` (no trailing slash)

## Research Task 3: Frontend Rebuild and Redeploy

### Findings

**Build-time injection**: `docusaurus.config.ts` reads `process.env.REACT_APP_API_URL` at **build time** (not runtime). The value is baked into the static bundle:
```typescript
customFields: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
},
```

**GitHub Actions workflow**: `.github/workflows/deploy.yml` passes `vars.API_URL` as `REACT_APP_API_URL` env var during `npm run build`. The workflow triggers on:
- Push to `main` branch
- Manual `workflow_dispatch`

**Current state**: `API_URL` GitHub variable was already updated to the Railway URL. But no push to `main` or manual dispatch has happened since, so the frontend is still serving the old bundle with `localhost:8000`.

### Decision: Trigger `workflow_dispatch` to redeploy frontend

**Rationale**: The `API_URL` variable is already correct. We just need to trigger the workflow. Options:
1. `gh workflow run deploy.yml` — Manual trigger via GitHub CLI ✅
2. Push any commit to `main` — Triggers automatically
3. Manual trigger via GitHub Actions UI

**Alternative considered**: Runtime API URL detection — would require changing `docusaurus.config.ts` to read from `window.location` or a runtime config endpoint. Rejected because it's a code change and the build-time injection works fine once redeployed.

## Research Task 4: Cross-Origin Cookie Configuration

### Findings

**Cookie config** (`cookie_config.py`): When `APP_ENV=production` OR any HTTPS origin is detected:
- `secure = True`
- `samesite = "none"`

This is correct for cross-origin cookies between `abdullahzunorain.github.io` (frontend) and `*.railway.app` (backend).

**Browser requirements** for cross-origin cookies:
- Backend must send `Set-Cookie` with `SameSite=None; Secure`
- Frontend must send requests with `credentials: 'include'`  
- Backend CORS must have `allow_credentials=True` ✅ (verified in `main.py`)
- Backend `Access-Control-Allow-Origin` must NOT be `*` when credentials are used ✅ (explicit origins list)

### Decision: Cookie config is correct — requires only `APP_ENV=production` in Railway

**Rationale**: The existing code handles this automatically. No code changes needed.

## Summary of Resolutions

| Unknown | Resolution | Action |
|---------|-----------|--------|
| /health 502 root cause | Serverless cold-start timing + possible missing env vars | Verify env vars, re-test |
| Railway env vars | 7 required variables identified | Set in Railway dashboard |
| Frontend stale build | API_URL already set, needs workflow trigger | Run `gh workflow run deploy.yml` |
| Cross-origin cookies | Code handles this when APP_ENV=production | Confirm env var is set |
| migrate.py blocking | Gracefully skips when no DATABASE_URL | Non-issue, but set the var anyway |

**All NEEDS CLARIFICATION items resolved.** Ready for Phase 1.
