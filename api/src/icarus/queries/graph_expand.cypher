MATCH (center) WHERE elementId(center) = $entity_id
CALL apoc.path.subgraphAll(center, {
  relationshipFilter: "SOCIO_DE|DOOU|CANDIDATO_EM|VENCEU|AUTOR_EMENDA|SANCIONADA",
  labelFilter: "-User|-Investigation|-Annotation|-Tag",
  maxLevel: $depth,
  limit: 200
})
YIELD nodes, relationships
RETURN nodes, relationships, elementId(center) AS center_id
