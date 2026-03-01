# Public vs Advanced Endpoint Matrix

## Public mode defaults
- `PUBLIC_MODE=true`
- `PUBLIC_ALLOW_PERSON=false`
- `PUBLIC_ALLOW_ENTITY_LOOKUP=false`
- `PUBLIC_ALLOW_INVESTIGATIONS=false`

## Endpoint behavior

| Endpoint | PUBLIC_MODE=false (advanced) | PUBLIC_MODE=true (default) |
|---|---|---|
| `GET /api/v1/entity/{cpf_or_cnpj}` | Allowed | `403` (`Entity lookup endpoint disabled in public mode`) |
| `GET /api/v1/entity/by-element-id/{id}` | Allowed | `403` (`Entity lookup endpoint disabled in public mode`) |
| `GET /api/v1/entity/{id}/connections` | Allowed | Person/Partner targets filtered out |
| `GET /api/v1/search` | Allowed | Person/Partner results filtered out |
| `GET /api/v1/graph/{entity_id}` | Allowed | Person/Partner center blocked, person nodes filtered |
| `GET /api/v1/patterns/{entity_id}` | Allowed | `403` when `PUBLIC_ALLOW_ENTITY_LOOKUP=false` |
| `GET /api/v1/investigations/*` | Allowed | `403` (`Investigation endpoints disabled in public mode`) |
| `GET /api/v1/public/meta` | Allowed | Allowed |
| `GET /api/v1/public/patterns/company/{cnpj_or_id}` | Allowed | Allowed |
| `GET /api/v1/public/graph/company/{cnpj_or_id}` | Allowed | Allowed |

## Exposure tier contract
- `public_safe`: company/contract/sanction/aggregate entities allowed on public surface.
- `restricted`: person-adjacent entities (not returned by default in public mode).
- `internal_only`: workspace/admin artifacts (`User`, `Investigation`, `Annotation`, `Tag`).
