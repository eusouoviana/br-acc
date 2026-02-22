from abc import ABC, abstractmethod

from neo4j import Driver


class Pipeline(ABC):
    """Base class for all ETL pipelines."""

    name: str
    source_id: str

    def __init__(self, driver: Driver, data_dir: str = "./data") -> None:
        self.driver = driver
        self.data_dir = data_dir

    @abstractmethod
    def extract(self) -> None:
        """Download raw data from source."""

    @abstractmethod
    def transform(self) -> None:
        """Normalize, deduplicate, and prepare data for loading."""

    @abstractmethod
    def load(self) -> None:
        """Load transformed data into Neo4j."""

    def run(self) -> None:
        """Execute the full ETL pipeline."""
        print(f"[{self.name}] Starting extraction...")
        self.extract()
        print(f"[{self.name}] Starting transformation...")
        self.transform()
        print(f"[{self.name}] Starting load...")
        self.load()
        print(f"[{self.name}] Pipeline complete.")
