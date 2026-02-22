from typing import Annotated

from fastapi import APIRouter, Depends
from neo4j import AsyncSession

from icarus.dependencies import get_session

router = APIRouter(prefix="/api/v1/meta", tags=["meta"])


@router.get("/health")
async def neo4j_health(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, str]:
    result = await session.run("RETURN 1 AS ok")
    record = await result.single()
    if record and record["ok"] == 1:
        return {"neo4j": "connected"}
    return {"neo4j": "error"}


@router.get("/sources")
async def list_sources() -> dict[str, list[dict[str, str]]]:
    return {
        "sources": [
            {"id": "cnpj", "name": "Receita Federal (CNPJ)", "frequency": "monthly"},
            {"id": "tse", "name": "Tribunal Superior Eleitoral", "frequency": "biennial"},
            {"id": "transparencia", "name": "Portal da Transparência", "frequency": "monthly"},
            {"id": "ceis", "name": "CEIS/CNEP/CEPIM/CEAF", "frequency": "monthly"},
        ]
    }
