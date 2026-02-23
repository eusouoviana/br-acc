import logging
from pathlib import Path
from typing import Any

from neo4j import AsyncDriver, AsyncSession, Record

logger = logging.getLogger(__name__)

QUERIES_DIR = Path(__file__).parent.parent / "queries"


class CypherLoader:
    """Loads and caches .cypher query files."""

    _cache: dict[str, str] = {}

    @classmethod
    def load(cls, name: str) -> str:
        if name not in cls._cache:
            path = QUERIES_DIR / f"{name}.cypher"
            if not path.exists():
                msg = f"Query file not found: {path}"
                raise FileNotFoundError(msg)
            cls._cache[name] = path.read_text().strip()
        return cls._cache[name]

    @classmethod
    def clear_cache(cls) -> None:
        cls._cache.clear()


async def execute_query(
    session: AsyncSession,
    query_name: str,
    parameters: dict[str, Any] | None = None,
    timeout: float = 15,
) -> list[Record]:
    """Execute a named .cypher query with parameter binding."""
    cypher = CypherLoader.load(query_name)
    result = await session.run(cypher, parameters or {}, timeout=timeout)
    return [record async for record in result]


async def execute_query_single(
    session: AsyncSession,
    query_name: str,
    parameters: dict[str, Any] | None = None,
    timeout: float = 15,
) -> Record | None:
    """Execute a named query and return a single record."""
    cypher = CypherLoader.load(query_name)
    result = await session.run(cypher, parameters or {}, timeout=timeout)
    return await result.single()


async def ensure_schema(driver: AsyncDriver) -> None:
    """Run schema_init.cypher statements on startup. All use IF NOT EXISTS so idempotent."""
    raw = CypherLoader.load("schema_init")
    statements = [s.strip() for s in raw.split(";") if s.strip()]
    async with driver.session() as session:
        for stmt in statements:
            # Skip comment-only lines
            lines = [ln for ln in stmt.splitlines() if not ln.strip().startswith("//")]
            cypher = "\n".join(lines).strip()
            if cypher:
                await session.run(cypher)
    logger.info("Schema bootstrap complete: %d statements executed", len(statements))
