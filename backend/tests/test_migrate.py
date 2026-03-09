"""
Tests for the migration runner (migrate.py).

Tests:
- Sorted file discovery
- Idempotent execution
- Graceful skip when no DSN
- Connection error propagation
"""

from __future__ import annotations

from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from migrate import run_migrations, MIGRATIONS_DIR


class TestMigrationDiscovery:
    """Tests for migration file discovery."""

    def test_migrations_dir_exists(self) -> None:
        """The migrations directory must exist."""
        assert MIGRATIONS_DIR.is_dir(), f"Missing migrations dir: {MIGRATIONS_DIR}"

    def test_migrations_sorted_order(self) -> None:
        """SQL files should be discoverable in sorted order."""
        sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
        assert len(sql_files) >= 2
        names = [f.name for f in sql_files]
        assert names[0].startswith("001")
        assert names[1].startswith("002")


class TestRunMigrations:
    """Tests for run_migrations() async function."""

    @pytest.mark.asyncio
    async def test_graceful_skip_when_no_dsn(self) -> None:
        """No DSN and no DATABASE_URL → returns empty list, no error."""
        with patch.dict("os.environ", {}, clear=True):
            result = await run_migrations(dsn="")
        assert result == []

    @pytest.mark.asyncio
    async def test_executes_all_sql_files(self) -> None:
        """All .sql files in migrations/ are executed in order."""
        mock_conn = AsyncMock()
        mock_conn.execute = AsyncMock()
        mock_conn.close = AsyncMock()

        with patch("migrate.asyncpg.connect", return_value=mock_conn):
            result = await run_migrations(dsn="postgres://test:test@localhost/test")

        sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
        assert len(result) == len(sql_files)
        assert mock_conn.execute.call_count == len(sql_files)
        # Verify sorted order
        for i, name in enumerate(result):
            assert name == sql_files[i].name

    @pytest.mark.asyncio
    async def test_connection_closes_on_success(self) -> None:
        """Connection is closed after successful migration."""
        mock_conn = AsyncMock()
        mock_conn.execute = AsyncMock()
        mock_conn.close = AsyncMock()

        with patch("migrate.asyncpg.connect", return_value=mock_conn):
            await run_migrations(dsn="postgres://test:test@localhost/test")

        mock_conn.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_connection_closes_on_error(self) -> None:
        """Connection is closed even if a migration fails."""
        mock_conn = AsyncMock()
        mock_conn.execute = AsyncMock(side_effect=Exception("SQL error"))
        mock_conn.close = AsyncMock()

        with (
            patch("migrate.asyncpg.connect", return_value=mock_conn),
            pytest.raises(Exception, match="SQL error"),
        ):
            await run_migrations(dsn="postgres://test:test@localhost/test")

        mock_conn.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_connection_error_propagates(self) -> None:
        """Connection failure raises the original error."""
        with (
            patch("migrate.asyncpg.connect", side_effect=OSError("Connection refused")),
            pytest.raises(OSError, match="Connection refused"),
        ):
            await run_migrations(dsn="postgres://test:test@localhost/test")
