from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends, Request
from neo4j import AsyncDriver, AsyncGraphDatabase, AsyncSession

from icarus.config import settings

_driver: AsyncDriver | None = None


async def init_driver() -> AsyncDriver:
    global _driver
    _driver = AsyncGraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    await _driver.verify_connectivity()
    return _driver


async def close_driver() -> None:
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None


async def get_driver(request: Request) -> AsyncDriver:
    driver: AsyncDriver = request.app.state.neo4j_driver
    return driver


async def get_session(
    driver: Annotated[AsyncDriver, Depends(get_driver)],
) -> AsyncGenerator[AsyncSession]:
    async with driver.session() as session:
        yield session
