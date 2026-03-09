"""
asyncpg connection pool for Neon Postgres.

Usage:
    pool = await ensure_pool()  # lazy init, returns active pool
    await close_pool()          # call at shutdown
"""

from __future__ import annotations

import os

import asyncpg

_pool: asyncpg.Pool | None = None


async def ensure_pool() -> asyncpg.Pool:
    """Return the active pool, creating it lazily on first call.

    Reads DATABASE_URL from the environment. Raises ValueError when the
    variable is missing or empty.
    """
    global _pool  # noqa: PLW0603
    if _pool is not None:
        return _pool

    connection_string: str = os.getenv("DATABASE_URL", "")
    if not connection_string:
        raise ValueError("DATABASE_URL environment variable is required")

    _pool = await asyncpg.create_pool(
        connection_string,
        min_size=2,
        max_size=10,
        ssl="require",
    )
    return _pool


async def close_pool() -> None:
    """Close the connection pool gracefully."""
    global _pool  # noqa: PLW0603
    if _pool is not None:
        await _pool.close()
        _pool = None
