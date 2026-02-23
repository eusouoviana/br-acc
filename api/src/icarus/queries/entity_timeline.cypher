// Fetch temporal events one hop from entity with cursor-based pagination
MATCH (e)-[r]-(n)
WHERE elementId(e) = $entity_id
  AND (n:Contract OR n:Sanction OR n:Amendment OR n:Election)
WITH n, labels(n) AS lbls,
     COALESCE(n.date, n.date_start, toString(n.ano_eleicao)) AS event_date
WHERE event_date IS NOT NULL AND event_date <> ''
  AND ($cursor IS NULL OR event_date < $cursor)
RETURN elementId(n) AS id, event_date, lbls, properties(n) AS props
ORDER BY event_date DESC
LIMIT $limit
