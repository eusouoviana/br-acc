from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from neo4j import AsyncDriver, AsyncGraphDatabase, AsyncSession

from icarus.config import settings
from icarus.models.user import UserResponse
from icarus.services import auth_service

_driver: AsyncDriver | None = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def init_driver() -> AsyncDriver:
    global _driver
    _driver = AsyncGraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
        max_connection_pool_size=50,
        connection_acquisition_timeout=10,
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


async def get_current_user(
    token: Annotated[str | None, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> UserResponse:
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user_id = auth_service.decode_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = await auth_service.get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_optional_user(
    token: Annotated[str | None, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> UserResponse | None:
    if token is None:
        return None
    user_id = auth_service.decode_access_token(token)
    if user_id is None:
        return None
    return await auth_service.get_user_by_id(session, user_id)


CurrentUser = Annotated[UserResponse, Depends(get_current_user)]
