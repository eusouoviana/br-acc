# World Transparency Graph (WTG) — Icarus Core

Plataforma global de análise de grafos de dados públicos.

Global public-data graph analysis platform.

[![CI](https://github.com/brunoclz/world-transparency-graph/actions/workflows/ci.yml/badge.svg)](https://github.com/brunoclz/world-transparency-graph/actions/workflows/ci.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

---

## O que é / What it is

WTG (powered by Icarus Core) ingere dados de registros públicos e permite a exploração visual de conexões entre empresas, contratos, eleições e sanções.

WTG (powered by Icarus Core) ingests public records and enables visual exploration of connections between companies, contracts, elections, and sanctions.

**Dados de registros públicos. Não constitui acusação.**

**Data patterns from public records. Not accusations.**

## Modelo de marca / Brand model

- Produto público: **World Transparency Graph (WTG)**
- Movimento cívico: **BRCC**
- Engine institucional: **Icarus Core**

## Arquitetura / Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend   │────▶│   FastAPI     │────▶│    Neo4j     │
│  React SPA  │     │   REST API    │     │  Graph DB    │
│  :3000      │     │   :8000       │     │  :7687       │
└─────────────┘     └──────────────┘     └──────────────┘
                           ▲
                    ┌──────┴──────┐
                    │  ETL Pipes  │
                    │  CNPJ, TSE  │
                    │  Transp,    │
                    │  Sanctions  │
                    └─────────────┘
```

| Camada / Layer | Tecnologia / Tech |
|---|---|
| Graph DB | Neo4j 5 Community |
| Backend | FastAPI (Python 3.12+, async) |
| Frontend | Vite + React 19 + TypeScript |
| ETL | Python (pandas, httpx) |
| Entity Resolution | splink 4 (optional) |
| Infra | Docker Compose |
| i18n | PT-BR (padrão), EN |

## Início rápido / Quick start

```bash
# Pré-requisitos: Docker, Node 22+, Python 3.12+, uv
cp .env.example .env
# Edite .env com sua senha Neo4j

# Subir stack completa
make dev

# Carregar dados de desenvolvimento
export NEO4J_PASSWORD=your_password
make seed

# API: http://localhost:8000/health
# Frontend: http://localhost:3000
# Neo4j Browser: http://localhost:7474
```

## Desenvolvimento / Development

```bash
# Instalar dependências
cd api && uv sync --dev
cd etl && uv sync --dev
cd frontend && npm install

# Rodar serviços individuais
make api           # FastAPI com hot reload
make frontend      # Vite dev server

# ETL
cd etl && uv run icarus-etl sources   # Listar pipelines
cd etl && uv run icarus-etl run --source cnpj --neo4j-password $NEO4J_PASSWORD

# Verificações de qualidade (rodar antes de commit)
make check         # lint + types + tests
make neutrality    # auditoria de palavras proibidas
```

## Testes / Tests

```bash
make test          # Todos (API + ETL + Frontend)
make test-api      # 79 testes Python
make test-etl      # 63 testes Python
make test-frontend # 20 testes TypeScript
```

## Padrões de análise / Analysis patterns

| ID | PT-BR | EN |
|---|---|---|
| p01 | Emenda autodirecionada | Self-dealing amendment |
| p05 | Incompatibilidade patrimonial | Patrimony incompatibility |
| p06 | Sancionada ainda recebendo | Sanctioned still receiving |
| p10 | Ciclo doação-contrato | Donation-contract loop |
| p12 | Concentração de contratos | Contract concentration |

## Public mode contract

WTG Open deve rodar com defaults públicos:

- `PUBLIC_MODE=true`
- `PUBLIC_ALLOW_PERSON=false`
- `PUBLIC_ALLOW_ENTITY_LOOKUP=false`
- `PUBLIC_ALLOW_INVESTIGATIONS=false`

Com isso, o modo público não retorna nós de PF (`Person`/`Partner`) nem propriedades pessoais.

## Endpoints da API / API endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/v1/public/meta` | Métricas agregadas e saúde de fontes |
| GET | `/api/v1/public/patterns/company/{cnpj_or_id}` | Sinais públicos por empresa |
| GET | `/api/v1/public/graph/company/{cnpj_or_id}` | Subgrafo público de empresa |

### Advanced-only surface (internal deployment)

- `/api/v1/entity/*`
- `/api/v1/search`
- `/api/v1/graph/*`
- `/api/v1/patterns/*`
- `/api/v1/investigations/*`

## Estrutura / Project structure

```
CORRUPTOS/
├── api/                  # FastAPI backend
│   ├── src/icarus/
│   │   ├── routers/      # 7 routers
│   │   ├── services/     # Business logic
│   │   ├── queries/      # 27 .cypher files
│   │   ├── models/       # Pydantic models
│   │   └── middleware/    # CPF masking
│   └── tests/            # 79 unit tests
├── etl/                  # ETL pipelines
│   ├── src/icarus_etl/
│   │   ├── pipelines/    # CNPJ, TSE, Transparência, Sanctions
│   │   ├── transforms/   # Name norm, doc formatting, dedup
│   │   └── entity_resolution/  # splink config
│   └── tests/            # 63 unit tests
├── frontend/             # React SPA
│   └── src/
│       ├── components/   # Graph, Entity, Search, Pattern, Investigation
│       ├── pages/        # Home, Search, GraphExplorer, Patterns, Investigations
│       └── stores/       # Zustand
├── infra/                # Docker Compose + Neo4j schema + seed data
└── .github/workflows/    # CI pipeline
```

## Licença / License

[GNU Affero General Public License v3.0](LICENSE)
