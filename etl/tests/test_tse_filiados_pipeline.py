from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock

import pandas as pd

from icarus_etl.pipelines.tse_filiados import TseFiliadosPipeline, _membership_id

FIXTURES = Path(__file__).parent / "fixtures"


def _make_pipeline() -> TseFiliadosPipeline:
    driver = MagicMock()
    pipeline = TseFiliadosPipeline(driver=driver, data_dir=str(FIXTURES.parent))
    return pipeline


def _load_fixture_data(pipeline: TseFiliadosPipeline) -> None:
    """Load CSV fixture directly into the pipeline's raw DataFrame."""
    pipeline._raw = pd.read_csv(
        FIXTURES / "tse_filiados" / "filiados.csv",
        dtype=str,
        keep_default_na=False,
    )


class TestTseFiliadosMetadata:
    def test_name(self) -> None:
        assert TseFiliadosPipeline.name == "tse_filiados"

    def test_source_id(self) -> None:
        assert TseFiliadosPipeline.source_id == "tse_filiados"


class TestMembershipId:
    def test_deterministic(self) -> None:
        mid1 = _membership_id("JOAO DA SILVA", "PT", "SP", "2010-03-15")
        mid2 = _membership_id("JOAO DA SILVA", "PT", "SP", "2010-03-15")
        assert mid1 == mid2

    def test_different_inputs_different_ids(self) -> None:
        mid1 = _membership_id("JOAO DA SILVA", "PT", "SP", "2010-03-15")
        mid2 = _membership_id("JOAO DA SILVA", "MDB", "SP", "2010-03-15")
        assert mid1 != mid2

    def test_length(self) -> None:
        mid = _membership_id("JOAO", "PT", "SP", "2020-01-01")
        assert len(mid) == 16


class TestTseFiliadosTransform:
    def test_produces_memberships(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        # 4 valid rows out of 5 (1 has empty name)
        assert len(pipeline.memberships) == 4

    def test_produces_person_rels(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        assert len(pipeline.person_rels) == 4

    def test_normalizes_names(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        names = {m["name"] for m in pipeline.memberships}
        assert "JOAO DA SILVA" in names
        assert "MARIA SOUZA" in names
        assert "PEDRO SANTOS" in names
        assert "ANA LIMA" in names

    def test_skips_empty_name(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        names = {m["name"] for m in pipeline.memberships}
        assert "" not in names

    def test_preserves_party(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        parties = {m["party"] for m in pipeline.memberships}
        assert "PT" in parties
        assert "MDB" in parties
        assert "PSDB" in parties
        assert "PL" in parties

    def test_preserves_uf(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        ufs = {m["uf"] for m in pipeline.memberships}
        assert "SP" in ufs
        assert "RJ" in ufs
        assert "MG" in ufs

    def test_parses_affiliation_date(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        dates = {m["affiliation_date"] for m in pipeline.memberships}
        assert "2010-03-15" in dates
        assert "2015-07-22" in dates

    def test_preserves_status(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        statuses = {m["status"] for m in pipeline.memberships}
        assert "REGULAR" in statuses
        assert "CANCELADO" in statuses

    def test_membership_fields(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        m = pipeline.memberships[0]
        assert "membership_id" in m
        assert "name" in m
        assert "party" in m
        assert "uf" in m
        assert "affiliation_date" in m
        assert "status" in m
        assert "municipality_id" in m
        assert "birth_date" in m
        assert "source" in m
        assert m["source"] == "tse_filiados"

    def test_person_rel_fields(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        r = pipeline.person_rels[0]
        assert "source_name" in r
        assert "source_uf" in r
        assert "source_birth_date" in r
        assert "source_municipality_id" in r
        assert "target_key" in r
        assert "party" in r
        assert "affiliation_date" in r
        assert "status" in r

    def test_membership_id_is_deterministic_hash(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        for m in pipeline.memberships:
            assert len(m["membership_id"]) == 16

    def test_deduplicates_memberships(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()

        ids = [m["membership_id"] for m in pipeline.memberships]
        assert len(ids) == len(set(ids))


class TestTseFiliadosLoad:
    def test_load_creates_membership_nodes(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()
        pipeline.load()

        session_mock = pipeline.driver.session.return_value.__enter__.return_value
        run_calls = session_mock.run.call_args_list

        membership_calls = [
            call for call in run_calls
            if "MERGE (n:PartyMembership" in str(call)
        ]
        assert len(membership_calls) >= 1

    def test_load_creates_filiado_a_relationships(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()
        pipeline.load()

        session_mock = pipeline.driver.session.return_value.__enter__.return_value
        run_calls = session_mock.run.call_args_list

        rel_calls = [
            call for call in run_calls
            if "FILIADO_A" in str(call)
        ]
        assert len(rel_calls) >= 1

    def test_load_uses_tiered_matching(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()
        pipeline.load()

        session_mock = pipeline.driver.session.return_value.__enter__.return_value
        run_calls = session_mock.run.call_args_list

        # Should have match_confidence in relationship queries
        confidence_calls = [
            call for call in run_calls
            if "match_confidence" in str(call)
        ]
        assert len(confidence_calls) >= 1

    def test_load_tiers_split_correctly(self) -> None:
        pipeline = _make_pipeline()
        _load_fixture_data(pipeline)
        pipeline.transform()
        pipeline.load()

        session_mock = pipeline.driver.session.return_value.__enter__.return_value
        run_calls = session_mock.run.call_args_list

        high_calls = [c for c in run_calls if "'high'" in str(c)]
        low_calls = [c for c in run_calls if "'low'" in str(c)]
        # Fixture: 2 rows with birth_date (high), 1 with muni only (medium), 1 without either (low)
        assert len(high_calls) >= 1
        assert len(low_calls) >= 1

    def test_load_skips_when_empty(self) -> None:
        pipeline = _make_pipeline()
        pipeline.memberships = []
        pipeline.person_rels = []
        pipeline.load()

        session_mock = pipeline.driver.session.return_value.__enter__.return_value
        assert session_mock.run.call_count == 0
