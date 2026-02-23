from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession

from icarus.constants import PEP_ROLES
from icarus.dependencies import get_session
from icarus.models.entity import SourceAttribution
from icarus.models.graph import GraphEdge, GraphNode, GraphResponse
from icarus.services.neo4j_service import execute_query

router = APIRouter(prefix="/api/v1/graph", tags=["graph"])


def _is_pep(properties: dict[str, Any]) -> bool:
    role = str(properties.get("role", "")).lower()
    return any(keyword in role for keyword in PEP_ROLES)


def _extract_label(node: Any, labels: list[str]) -> str:
    props = dict(node)
    entity_type = labels[0].lower() if labels else ""
    if entity_type == "company":
        return str(props.get("razao_social", props.get("name", props.get("nome_fantasia", ""))))
    return str(props.get("name", str(props.get("id", ""))))


@router.get("/{entity_id}", response_model=GraphResponse)
async def get_graph(
    entity_id: str,
    session: Annotated[AsyncSession, Depends(get_session)],
    depth: Annotated[int, Query(ge=1, le=4)] = 2,
    entity_types: Annotated[str | None, Query()] = None,
) -> GraphResponse:
    type_list = [t.strip().lower() for t in entity_types.split(",")] if entity_types else None

    records = await execute_query(
        session,
        "graph_expand",
        {"entity_id": entity_id, "entity_types": type_list, "depth": depth},
    )

    if not records:
        raise HTTPException(status_code=404, detail="Entity not found")

    record = records[0]
    raw_nodes = record["nodes"]
    raw_rels = record["relationships"]
    center_id = record["center_id"]

    # Parse nodes
    nodes: list[GraphNode] = []
    node_ids: set[str] = set()

    for node in raw_nodes:
        node_id = node.element_id
        labels = list(node.labels)

        if type_list and not any(lb.lower() in type_list for lb in labels):
            continue

        node_ids.add(node_id)
        props = dict(node)
        source_val = props.pop("source", None)
        sources: list[SourceAttribution] = []
        if isinstance(source_val, str):
            sources = [SourceAttribution(database=source_val)]
        elif isinstance(source_val, list):
            sources = [SourceAttribution(database=s) for s in source_val]

        doc_id = (
            props.get("cpf")
            or props.get("cnpj")
            or props.get("contract_id")
            or props.get("sanction_id")
            or props.get("amendment_id")
        )
        document_id = str(doc_id) if doc_id else None

        nodes.append(GraphNode(
            id=node_id,
            label=_extract_label(node, labels),
            type=labels[0].lower() if labels else "unknown",
            document_id=document_id,
            properties=props,
            sources=sources,
            is_pep=_is_pep(props),
        ))

    # Parse edges — only between accepted nodes
    edges: list[GraphEdge] = []
    seen_edges: set[str] = set()

    for rel in raw_rels:
        rel_id = rel.element_id
        if rel_id in seen_edges:
            continue
        seen_edges.add(rel_id)

        source_id = rel.start_node.element_id
        target_id = rel.end_node.element_id

        if source_id not in node_ids or target_id not in node_ids:
            continue

        rel_props = dict(rel)
        confidence = float(rel_props.pop("confidence", 1.0))
        rel_source_val = rel_props.pop("source", None)
        rel_sources: list[SourceAttribution] = []
        if isinstance(rel_source_val, str):
            rel_sources = [SourceAttribution(database=rel_source_val)]
        elif isinstance(rel_source_val, list):
            rel_sources = [SourceAttribution(database=s) for s in rel_source_val]

        edges.append(GraphEdge(
            id=rel_id,
            source=source_id,
            target=target_id,
            type=rel.type,
            properties=rel_props,
            confidence=confidence,
            sources=rel_sources,
        ))

    return GraphResponse(nodes=nodes, edges=edges, center_id=center_id)
