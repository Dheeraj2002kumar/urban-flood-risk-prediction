"""Singleton ModelService managing ML model pipeline lifecycle."""
import json
from pathlib import Path
from typing import Any, Dict, Optional
from backend.app.core.config import settings
from backend.app.core.logging_config import get_app_logger
from ml.src.models.predict import FloodRiskPredictor

logger = get_app_logger("backend.model_service")

class ModelService:
    _instance: Optional["ModelService"] = None

    def __init__(self):
        self.predictor: Optional[FloodRiskPredictor] = None
        self.is_loaded = False
        self.load_model()

    @classmethod
    def get_instance(cls) -> "ModelService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self):
        try:
            self.predictor = FloodRiskPredictor(
                artifact_path=settings.MODEL_ARTIFACT_PATH,
                metadata_path=settings.METADATA_PATH,
                schema_path=settings.SCHEMA_PATH,
            )
            self.is_loaded = True
            logger.info("Successfully loaded ML pipeline into ModelService.")
        except Exception as e:
            logger.error(f"Failed to load ML pipeline: {e}")
            self.is_loaded = False
            self.predictor = None

    def get_model_info(self) -> Dict[str, Any]:
        if not self.is_loaded or not self.predictor:
            return {"status": "unloaded", "message": "ML model pipeline is not loaded."}
        return self.predictor.metadata

    def get_metrics(self) -> Dict[str, Any]:
        p = Path(settings.METRICS_PATH)
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"error": "Metrics file not found. Please train models first."}

    def get_comparison(self) -> Any:
        p = Path(settings.COMPARISON_PATH)
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def predict(
        self,
        features: Dict[str, float],
        location_id: Optional[str] = None,
        location_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        if not self.is_loaded or not self.predictor:
            raise RuntimeError("Model pipeline is not loaded. Cannot run inference.")
        return self.predictor.predict_single(
            features=features,
            location_id=location_id,
            location_name=location_name,
        )
