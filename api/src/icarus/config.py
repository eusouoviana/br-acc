from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "changeme"

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    log_level: str = "info"

    model_config = {"env_prefix": "", "env_file": ".env"}


settings = Settings()
