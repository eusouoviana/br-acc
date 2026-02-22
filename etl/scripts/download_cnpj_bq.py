#!/usr/bin/env python3
"""Download CNPJ data from Base dos Dados (BigQuery mirror).

Streams full tables from BigQuery to local CSVs page-by-page to avoid OOM.
Requires `google-cloud-bigquery` and an authenticated GCP project.

Usage:
    python etl/scripts/download_cnpj_bq.py --billing-project icarus-corruptos
    python etl/scripts/download_cnpj_bq.py --billing-project icarus-corruptos --tables empresas socios
    python etl/scripts/download_cnpj_bq.py --billing-project icarus-corruptos --skip-existing
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

import click

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

BQ_PROJECT = "basedosdados"
BQ_DATASET = "br_me_cnpj"

# Only read columns the pipeline actually uses.
TABLES: dict[str, list[str]] = {
    "empresas": [
        "cnpj_basico", "razao_social", "natureza_juridica",
        "qualificacao_responsavel", "capital_social", "porte", "ente_federativo",
    ],
    "socios": [
        "cnpj_basico", "tipo", "nome", "documento", "qualificacao",
        "data_entrada_sociedade", "id_pais", "cpf_representante_legal",
        "nome_representante_legal", "qualificacao_representante_legal", "faixa_etaria",
    ],
    "estabelecimentos": [
        "cnpj_basico", "cnpj_ordem", "cnpj_dv", "identificador_matriz_filial",
        "nome_fantasia", "situacao_cadastral", "data_situacao_cadastral",
        "motivo_situacao_cadastral", "nome_cidade_exterior", "id_pais",
        "data_inicio_atividade", "cnae_fiscal_principal", "cnae_fiscal_secundaria",
        "tipo_logradouro", "logradouro", "numero", "complemento", "bairro", "cep",
        "sigla_uf", "id_municipio", "ddd_1", "telefone_1", "ddd_2", "telefone_2",
        "ddd_fax", "fax", "email", "situacao_especial", "data_situacao_especial",
    ],
}

# Rows per page when streaming via BQ Storage Read API.
PAGE_SIZE = 100_000


def _download_table(
    billing_project: str,
    table: str,
    columns: list[str],
    output_dir: Path,
    *,
    skip_existing: bool = False,
) -> None:
    """Stream a BQ table directly to a CSV file.

    Uses list_rows() with selected_fields + BQ Storage Read API.
    No temp tables, no query — reads directly from BD's public dataset.
    """
    from google.cloud import bigquery

    dest = output_dir / f"{table}.csv"
    if skip_existing and dest.exists():
        logger.info("Skipping (exists): %s", dest.name)
        return

    client = bigquery.Client(project=billing_project)
    table_ref = f"{BQ_PROJECT}.{BQ_DATASET}.{table}"
    logger.info("Reading %s (%d columns)...", table_ref, len(columns))

    # Build selected_fields from column names
    schema_fields = [bigquery.SchemaField(c, "STRING") for c in columns]

    rows_written = 0
    for i, chunk_df in enumerate(
        client.list_rows(table_ref, selected_fields=schema_fields, page_size=PAGE_SIZE)
        .to_dataframe_iterable(),
    ):
        chunk_df.to_csv(dest, mode="a", header=(i == 0), index=False)
        rows_written += len(chunk_df)
        if i == 0 or rows_written % (PAGE_SIZE * 5) == 0:
            logger.info("  %s: %d rows written", table, rows_written)

    logger.info("Done: %s -> %s (%d rows)", table, dest.name, rows_written)


@click.command()
@click.option("--billing-project", required=True, help="GCP project for BigQuery billing")
@click.option("--output-dir", default="../data/cnpj/extracted", help="Output directory for CSVs")
@click.option(
    "--tables",
    multiple=True,
    type=click.Choice(list(TABLES.keys())),
    help="Tables to download (default: all)",
)
@click.option("--skip-existing", is_flag=True, help="Skip tables whose CSV already exists")
def main(
    billing_project: str,
    output_dir: str,
    tables: tuple[str, ...],
    skip_existing: bool,
) -> None:
    """Download CNPJ data from Base dos Dados (BigQuery) to local CSVs."""
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    selected = list(tables) if tables else list(TABLES.keys())
    logger.info(
        "Downloading %d table(s) from %s (billing: %s)",
        len(selected), f"{BQ_PROJECT}.{BQ_DATASET}", billing_project,
    )

    for table in selected:
        columns = TABLES[table]
        _download_table(billing_project, table, columns, out, skip_existing=skip_existing)

    # Print summary
    logger.info("=== Download complete ===")
    for f in sorted(out.iterdir()):
        if f.is_file():
            size_mb = f.stat().st_size / 1e6
            logger.info("  %s: %.1f MB", f.name, size_mb)


if __name__ == "__main__":
    main()
    sys.exit(0)
