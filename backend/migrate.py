"""
Lightweight migration runner using asyncpg.

Reads all .sql files from the migrations/ directory and executes them
in sorted order. All migrations use IF NOT EXISTS so re-running is safe.

CLI usage:  python migrate.py
Library:    await run_migrations(dsn)
"""

from __future__ import annotations

import asyncio
import logging
import os
from pathlib import Path

import asyncpg

logger = logging.getLogger(__name__)

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


async def run_migrations(dsn: str | None = None) -> list[str]:
    """Execute all .sql migration files in sorted order.

    Args:
        dsn: Postgres connection string. Defaults to DATABASE_URL env var.

    Returns:
        List of applied migration filenames.
    """
    connection_string = dsn or os.getenv("DATABASE_URL", "")
    if not connection_string:
        logger.warning("No DATABASE_URL set — skipping migrations")
        return []

    conn = await asyncpg.connect(connection_string, ssl="require")
    applied: list[str] = []
    try:
        for sql_file in sorted(MIGRATIONS_DIR.glob("*.sql")):
            sql = sql_file.read_text()
            await conn.execute(sql)
            applied.append(sql_file.name)
            logger.info("Applied migration: %s", sql_file.name)
    finally:
        await conn.close()

    logger.info("Migrations complete: %d applied", len(applied))
    return applied


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_migrations())
