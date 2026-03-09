# Research: Fix Railway Backend Deployment

**Feature**: `010-fix-railway-deploy` | **Date**: 2026-03-09

## Research Tasks

### R1 — Railway `railway.json` Config-as-Code Schema

**Unknown**: What fields does `railway.json` support for build, deploy, healthcheck, watch paths, and serverless settings?

**Decision**: Use Railway's official schema (`https://railway.com/railway.schema.json`) with full deploy/build config.

**Rationale**: The current `railway.json` only has `builder`, `startCommand`, and `restartPolicy`. The Railway dashboard has additional settings (healthcheck, sleep, watch paths) that aren't reflected in the file. Config-as-code should be the single source of truth.

**Findings**:

The `railway.json` deploy section supports:
- `startCommand` — entrypoint command
- `healthcheckPath` — HTTP path for health check (string, e.g., `/health`)
- `healthcheckTimeout` — seconds to wait (number)
- `sleepApplication` — enable serverless sleep (boolean)
- `restartPolicyType` — `ON_FAILURE`, `ALWAYS`, `NEVER`
- `restartPolicyMaxRetries` — max restart count (number)
- `numReplicas` — instance count (number)

The build section supports:
- `builder` — `NIXPACKS` | `DOCKERFILE` | `HEROKU`
- `buildCommand` — custom build command (string)
- `watchPatterns` — array of glob patterns to trigger builds (string[])

Key pattern for watch paths:
```json
"build": {
  "builder": "NIXPACKS",
  "watchPatterns": ["backend/**"]
}
```

This ensures only commits touching `backend/` trigger Railway builds.

**Alternatives considered**:
- Procfile-only deploy: Too limited; doesn't support healthcheck or watch paths
- Dockerfile: Over-engineering for this project; Nixpacks auto-detects Python correctly

---

### R2 — asyncpg Lazy Pool Initialization Pattern

**Unknown**: How to implement lazy DB pool init so the pool is created on first DB request, not at startup? Needed because Railway serverless sleep kills the process, and on wake the old pool (if any) would have stale connections.

**Decision**: Replace eager `init_pool()` at startup with an `ensure_pool()` async function that creates the pool on first call and reuses it thereafter.

**Rationale**: After Railway wakes from sleep, the process starts fresh — `_pool` is `None`. With lazy init, the first DB-dependent route will create the pool. The `/health` endpoint does NOT require DB, so it responds immediately (enabling Railway healthcheck to pass quickly).

**Pattern**:

```python
# db.py — lazy init pattern
_pool: asyncpg.Pool | None = None

async def ensure_pool() -> asyncpg.Pool:
    """Return the active pool, creating it on first call."""
    global _pool
    if _pool is None:
        dsn = os.getenv("DATABASE_URL", "")
        if not dsn:
            raise ValueError("DATABASE_URL environment variable is required")
        _pool = await asyncpg.create_pool(dsn, min_size=2, max_size=10, ssl="require")
    return _pool
```

- `get_pool()` is replaced by `ensure_pool()` (async)
- `init_pool()` is removed from `lifespan()` startup
- `close_pool()` remains in `lifespan()` shutdown
- All callers that use `get_pool()` switch to `await ensure_pool()`

**Impact on existing code**:
- Routes use `db.get_pool()` → change to `await db.ensure_pool()`
- `lifespan()` in `main.py` no longer calls `init_pool()` at startup
- Tests that mock `get_pool()` need to mock `ensure_pool()` instead

**Alternatives considered**:
- Connection pool with auto-reconnect: asyncpg doesn't natively support this; would require wrapping every query in retry logic
- Middleware that checks pool health: More complex; lazy init is simpler and sufficient since Railway restarts the entire process

---

### R3 — Python Migration Runner (replacing `psql`)

**Unknown**: How to run SQL migrations without `psql` in the Nixpacks container?

**Decision**: Create a `migrate.py` script (~40 lines) that reads SQL files from `migrations/` and executes them using asyncpg. Call it from `main.py` lifespan during startup.

**Rationale**: Nixpacks Python containers don't include `psql`. A Python-based runner uses the existing `asyncpg` dependency (already installed) and runs migrations idempotently since all SQL uses `CREATE TABLE IF NOT EXISTS`.

**Pattern**:

```python
# migrate.py
import asyncio
import os
from pathlib import Path
import asyncpg

MIGRATIONS_DIR = Path(__file__).parent / "migrations"

async def run_migrations(dsn: str | None = None) -> list[str]:
    """Execute all .sql files in migrations/ in sorted order."""
    connection_string = dsn or os.getenv("DATABASE_URL", "")
    if not connection_string:
        return []
    
    conn = await asyncpg.connect(connection_string, ssl="require")
    applied = []
    try:
        for sql_file in sorted(MIGRATIONS_DIR.glob("*.sql")):
            sql = sql_file.read_text()
            await conn.execute(sql)
            applied.append(sql_file.name)
    finally:
        await conn.close()
    return applied
```

Key design decisions:
- Uses `asyncpg.connect()` (single connection) not the pool — migrations run before pool init
- Sorted glob ensures deterministic order (001, 002, ...)
- All migrations are idempotent (`IF NOT EXISTS`) so re-running is safe
- Returns list of applied filenames for logging
- No migration tracking table needed (idempotent SQL is sufficient for this project's scale)

**Alternatives considered**:
- Alembic: Full-featured but massive overkill for 2 idempotent SQL files
- Adding `psql` to Nixpacks via apt packages: Fragile; depends on Nixpacks Nix package availability
- `sqlalchemy` migrations: Project doesn't use SQLAlchemy; would add a new dependency

---

### R4 — CORS `allow_headers` for Cross-Origin Auth

**Unknown**: What headers should be allowed in CORS for cross-origin cookie-based auth to work?

**Decision**: Add `"Authorization"` to `allow_headers` alongside `"Content-Type"`.

**Rationale**: While current auth uses HttpOnly cookies (not Authorization header), the `Authorization` header should be allowed for completeness and future-proofing. Browser preflight (OPTIONS) requests will include `Access-Control-Request-Headers` with any custom headers the frontend sends.

**Current code** (main.py):
```python
allow_headers=["Content-Type"],
```

**Updated**:
```python
allow_headers=["Content-Type", "Authorization"],
```

**Note**: For cookie-based auth, the most critical CORS settings are:
- `allow_credentials=True` ✅ (already set)
- `allow_origins` includes the exact frontend origin ✅ (via `CORS_ORIGINS` env var)
- `allow_methods` includes the needed methods ✅ (GET, POST, OPTIONS)

---

### R5 — Railway Environment Variables Documentation

**Unknown**: What env vars must be set/changed in the Railway dashboard?

**Decision**: Document all required Railway dashboard changes in quickstart.md.

**Findings — Required Railway Environment Variables**:

| Variable | Required Value | Notes |
|----------|---------------|-------|
| `APP_ENV` | `production` | **MUST CHANGE** from `development`. Controls cookie security. |
| `CORS_ORIGINS` | `https://abdullahzunorain.github.io` | Production frontend only. No localhost. |
| `DATABASE_URL` | Neon Postgres connection string | **MUST REMOVE** `channel_binding=require` param if present. |
| `GOOGLE_API_KEY` | Gemini API key | Already set. |
| `QDRANT_URL` | Qdrant Cloud URL | Already set. |
| `QDRANT_API_KEY` | Qdrant Cloud API key | Already set. |
| `JWT_SECRET` | Strong random secret | Already set. |

**Dashboard-only changes** (no code changes):
1. Set `APP_ENV=production`
2. Remove `channel_binding=require` from `DATABASE_URL`
3. Set `CORS_ORIGINS=https://abdullahzunorain.github.io`

---

### R6 — Railway Serverless Sleep Behavior

**Unknown**: How does Railway serverless sleep affect the application process lifecycle?

**Decision**: Accept cold-start latency; mitigate DB staleness with lazy pool init.

**Findings**:
- When a Railway service has `sleepApplication: true` and receives no traffic for ~15 minutes, the container is paused/stopped.
- On the first incoming request, Railway wakes the service (cold start).
- The process restarts from scratch — `lifespan()` runs again, all module-level state is fresh.
- Cold start time: typically 5-15 seconds for a Python/uvicorn app.
- The health check runs after wake; if it passes, traffic is routed to the service.

**Implication**: Since the process restarts fully, `_pool = None` in `db.py` is correct on wake. The lazy init pattern will create a fresh pool on the first DB-requiring request. The `/health` endpoint should NOT depend on DB to allow fast healthcheck response.

**Current `/health` endpoint**:
```python
@app.get("/health")
async def health():
    return {"status": "ok"}
```
This is already DB-independent. ✅

---

## Summary of Decisions

| # | Topic | Decision |
|---|-------|----------|
| R1 | railway.json | Full config-as-code with healthcheck, watch paths, sleep setting |
| R2 | DB Pool | Lazy `ensure_pool()` pattern, no eager init at startup |
| R3 | Migrations | Python runner with asyncpg, called at startup in lifespan |
| R4 | CORS | Add `Authorization` to `allow_headers` |
| R5 | Env Vars | Document 3 dashboard-only changes in quickstart.md |
| R6 | Sleep | Accept cold-start; lazy init mitigates DB staleness |

All NEEDS CLARIFICATION items are now resolved. Proceeding to Phase 1 design.
