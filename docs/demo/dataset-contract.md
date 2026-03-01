# Demo Dataset Contract (WTG Open)

## Objective
Provide a reproducible, public-safe demo graph with synthetic records only.

## Safety rules
- Synthetic data only. No real CPF, no real personal names, no real personal addresses.
- Company identifiers may use synthetic CNPJ-like values reserved for demonstration.
- Demo graph cannot include `Person` or `Partner` labels.
- Demo exports must never include private or operational metadata.

## Required files
- `data/demo/synthetic_graph.json`
- `data/demo/README.md`
- `scripts/generate_demo_dataset.py`

## JSON schema (minimum)
- `nodes[]`: `{id, label, type, properties}`
- `edges[]`: `{id, source, target, type, properties}`
- `meta`: `{generated_at_utc, generator_version, source: "synthetic"}`

## Acceptance checks
- No field name contains `cpf`, `doc_partial`, or `doc_raw`.
- No node label equals `Person` or `Partner`.
- CI privacy gate passes.

## Runtime target
- Dedicated demo Neo4j instance (non-production).
- Public API served with `PUBLIC_MODE=true`.
