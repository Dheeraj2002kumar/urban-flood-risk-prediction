"""Backend service configuration using Pydantic Settings."""
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[3]

class Settings(BaseSettings):
    PROJECT_NAME: str = "Urban Flood Risk Prediction API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

    # Artifact paths (resolved relative to repository root)
    MODEL_ARTIFACT_PATH: str = str(REPO_ROOT / "ml/artifacts/flood_risk_pipeline.joblib")
    METADATA_PATH: str = str(REPO_ROOT / "ml/artifacts/model_metadata.json")
    SCHEMA_PATH: str = str(REPO_ROOT / "ml/artifacts/feature_schema.json")
    METRICS_PATH: str = str(REPO_ROOT / "ml/reports/metrics/metrics.json")
    COMPARISON_PATH: str = str(REPO_ROOT / "ml/reports/metrics/model_comparison.json")
    GEOJSON_PATH: str = str(REPO_ROOT / "frontend/public/sample-area.geojson")
    PROCESSED_DATA_PATH: str = str(REPO_ROOT / "data/processed/mumbai_flood_features.csv")

    model_config = SettingsConfigDict(
        env_file=str(REPO_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
