CALL {
  MATCH (n) RETURN count(n) AS total_nodes
}
CALL {
  MATCH ()-[r]->() RETURN count(r) AS total_relationships
}
CALL {
  MATCH (p:Person) RETURN count(p) AS person_count
}
CALL {
  MATCH (c:Company) RETURN count(c) AS company_count
}
RETURN total_nodes, total_relationships, person_count, company_count