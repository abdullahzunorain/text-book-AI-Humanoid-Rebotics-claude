# Contract: migrate.py Interface

**Feature**: `010-fix-railway-deploy` | **Date**: 2026-03-09

## Overview

A lightweight Python migration runner that replaces the `psql` pre-deploy command. Executes SQL migration files from `backend/migrations/` using asyncpg.

## Public API

### `run_migrations(dsn: str | None = None) -> list[str]` (async)

Executes all `.sql` files in `migrations/` directory in sorted order.

**Signature**:
```python
async def run_migrations(dsn: str | None = None) -> list[str]:
```

**Parameters**:
- `dsn` (optional): Postgres connection string. Defaults to `DATABASE_URL` env var.

**Returns**: List of applied migration filenames (e.g., `["001_create_auth_tables.sql", "002_add_cache_and_chat.sql"]`).

**Behavior**:
- If `dsn` is empty and `DATABASE_URL` is unset: returns empty list (graceful skip).
- Opens a single `asyncpg.connect()` connection (not pool).
- Reads and executes each `.sql` file in sorted order.
- All SQL is idempotent — safe to re-run on every deploy.
- Closes the connection in a `finally` block.
- Logs each applied migration.

**Error handling**:
- Connection failure: raises `asyncpg.PostgresError` (deploy fails, Railway doesn't start uvicorn).
- SQL syntax error: raises `asyncpg.PostgresError` (deploy fails — this is intentional; broken migrations should block deploy).

### CLI Entry Point

When run as `python migrate.py`, executes `run_migrations()` and exits.

```python
if __name__ == "__main__":
    import asyncio
    asyncio.run(run_migrations())
```

## Integration

**Railway startCommand**: `python migrate.py && uvicorn main:app --host 0.0.0.0 --port $PORT`

The `&&` ensures uvicorn only starts if migrations succeed. If `migrate.py` exits non-zero, Railway marks the deploy as failed.

## Invariants

1. Migration files MUST be named with numeric prefixes for deterministic ordering (e.g., `001_`, `002_`).
2. All migration SQL MUST be idempotent (`IF NOT EXISTS`, `IF NOT EXISTS`).
3. The runner uses a standalone connection, NOT the application pool.
4. SSL is always required (`ssl="require"`) for Neon Postgres.
