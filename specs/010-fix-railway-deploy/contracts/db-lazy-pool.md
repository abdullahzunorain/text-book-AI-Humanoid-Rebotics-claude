# Contract: db.py Lazy Pool Interface

**Feature**: `010-fix-railway-deploy` | **Date**: 2026-03-09

## Overview

The `db.py` module transitions from eager pool initialization (called once at startup) to lazy on-first-request initialization via `ensure_pool()`.

## Public API (After Change)

### `ensure_pool() -> asyncpg.Pool` (async)

Creates the pool on first call, returns the cached pool on subsequent calls.

**Signature**:
```python
async def ensure_pool() -> asyncpg.Pool:
```

**Behavior**:
- If `_pool is None`: reads `DATABASE_URL` env var, creates pool with `ssl="require"`, `min_size=2`, `max_size=10`
- If `_pool is not None`: returns existing pool immediately
- Raises `ValueError` if `DATABASE_URL` is empty/missing

**Thread safety**: Not required — FastAPI runs in single async event loop.

### `close_pool() -> None` (async)

Closes the pool and sets `_pool = None`. Called during lifespan shutdown.

**Signature**:
```python
async def close_pool() -> None:
```

### Removed: `init_pool(dsn)` and `get_pool()`

These functions are replaced by `ensure_pool()`.

## Migration Guide for Callers

| Before | After |
|--------|-------|
| `await init_pool(dsn)` | *(remove — no eager init)* |
| `pool = get_pool()` | `pool = await ensure_pool()` |
| `await close_pool()` | `await close_pool()` *(unchanged)* |

## Invariants

1. `/health` endpoint MUST NOT call `ensure_pool()` — it must respond without DB.
2. All DB-dependent routes MUST call `await ensure_pool()` before querying.
3. `close_pool()` MUST be called in lifespan shutdown to avoid connection leaks.
