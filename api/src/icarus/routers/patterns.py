from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncDriver, AsyncSession
from starlette.requests import Request

from icarus.dependencies import get_driver, get_session
from icarus.middleware.rate_limit import limiter
from icarus.models.pattern import PATTERN_METADATA, PatternResponse
from icarus.services.pattern_service import PATTERN_QUERIES, run_all_patterns, run_pattern

router = APIRouter(prefix="/api/v1/patterns", tags=["patterns"])


@router.get("/{entity_id}", response_model=PatternResponse)
@limiter.limit("30/minute")
async def get_patterns_for_entity(
    request: Request,
    entity_id: str,
    driver: Annotated[AsyncDriver, Depends(get_driver)],
    lang: Annotated[str, Query()] = "pt",
) -> PatternResponse:
    results = await run_all_patterns(driver, entity_id, lang)
    return PatternResponse(
        entity_id=entity_id,
        patterns=results,
        total=len(results),
    )


@router.get("/{entity_id}/{pattern_name}", response_model=PatternResponse)
@limiter.limit("30/minute")
async def get_specific_pattern(
    request: Request,
    entity_id: str,
    pattern_name: str,
    session: Annotated[AsyncSession, Depends(get_session)],
    lang: Annotated[str, Query()] = "pt",
) -> PatternResponse:
    if pattern_name not in PATTERN_QUERIES:
        available = list(PATTERN_QUERIES.keys())
        raise HTTPException(
            status_code=404,
            detail=f"Pattern not found: {pattern_name}. Available: {available}",
        )
    results = await run_pattern(session, pattern_name, entity_id, lang)
    return PatternResponse(
        entity_id=entity_id,
        patterns=results,
        total=len(results),
    )


@router.get("/", response_model=dict[str, list[dict[str, str]]])
async def list_patterns() -> dict[str, list[dict[str, str]]]:
    patterns = []
    for pid, meta in PATTERN_METADATA.items():
        patterns.append({
            "id": pid,
            "name_pt": meta.get("name_pt", pid),
            "name_en": meta.get("name_en", pid),
            "description_pt": meta.get("desc_pt", ""),
            "description_en": meta.get("desc_en", ""),
        })
    return {"patterns": patterns}
