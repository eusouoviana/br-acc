MATCH path = (e)-[*1..$depth]-(connected)
WHERE elementId(e) = $entity_id
  AND NOT connected:User AND NOT connected:Investigation AND NOT connected:Annotation AND NOT connected:Tag
  AND ALL(r IN relationships(path) WHERE type(r) IN ['SOCIO_DE','DOOU','CANDIDATO_EM','VENCEU','AUTOR_EMENDA','SANCIONADA'])
WITH e, last(relationships(path)) AS r, connected
RETURN e, r, connected,
       labels(e) AS source_labels,
       labels(connected) AS target_labels,
       type(r) AS rel_type,
       elementId(startNode(r)) AS source_id,
       elementId(endNode(r)) AS target_id,
       elementId(r) AS rel_id
LIMIT 200
