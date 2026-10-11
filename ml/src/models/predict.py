"""Inference service module for single and batch urban flood risk predictions."""
from datetime import datetime
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd
from ml.src.features.build_features import ALL_MODEL_FEATURES, compute_engineered_features
from ml.src.utils.logging_config import setup_logger

logger = setup_logger("ml.models.predict")

class FloodRiskPredictor:
    """Wrapper around trained pipeline with input validation and risk classification."""

    def __init__(
        self,
        artifact_path: str = "ml/artifacts/flood_risk_pipeline.joblib",
        metadata_path: str = "ml/artifacts/model_metadata.json",
        schema_path: str = "ml/artifacts/feature_schema.json",
    ):
        self.artifact_path = Path(artifact_path)
        self.metadata_path = Path(metadata_path)
        self.schema_path = Path(schema_path)
        self.pipeline = None
        self.metadata = {}
        self.schema = {}
        self._load()

    def _load(self):
        if not self.artifact_path.exists():
            raise FileNotFoundError(f"Model artifact missing at {self.artifact_path}")
        self.pipeline = joblib.load(self.artifact_path)

        if self.metadata_path.exists():
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

        if self.schema_path.exists():
            with open(self.schema_path, "r", encoding="utf-8") as f:
                self.schema = json.load(f)

        logger.info(
            f"Loaded model pipeline (Version: {self.metadata.get('model_version', 'unknown')})"
        )

    def validate_inputs(self, features: Dict[str, float]) -> List[str]:
        """Validates input feature presence and physical ranges."""
        errors = []
        required = self.schema.get("required_raw_features", [])
        ranges = self.schema.get("feature_ranges", {})

        for req in required:
            if req not in features:
                errors.append(f"Missing required feature: '{req}'")
            else:
                val = features[req]
                if not isinstance(val, (int, float)) or np.isnan(val):
                    errors.append(f"Feature '{req}' must be a valid number, got {val}")
                elif req in ranges:
                    min_val, max_val = ranges[req]
                    if val < min_val or val > max_val:
                        errors.append(
                            f"Feature '{req}' value {val} out of bounds [{min_val}, {max_val}]"
                        )
        return errors

    def predict_single(
        self,
        features: Dict[str, float],
        location_id: Optional[str] = None,
        location_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Runs validated inference for a single location record."""
        validation_errors = self.validate_inputs(features)
        if validation_errors:
            raise ValueError("; ".join(validation_errors))

        # Convert to single-row DataFrame
        df_single = pd.DataFrame([features])
        df_feat = compute_engineered_features(df_single)
        X = df_feat[ALL_MODEL_FEATURES]

        # Predict probability
        proba = float(self.pipeline.predict_proba(X)[0, 1])
        binary_pred = int(self.pipeline.predict(X)[0])

        # Risk category mapping
        cutoffs = self.metadata.get("thresholds", {"medium_risk_cutoff": 0.35, "high_risk_cutoff": 0.65})
        med_cut = cutoffs.get("medium_risk_cutoff", 0.35)
        high_cut = cutoffs.get("high_risk_cutoff", 0.65)

        if proba < med_cut:
            risk_class = "low"
            risk_label = "Low Flood Risk"
        elif proba < high_cut:
            risk_class = "medium"
            risk_label = "Medium Flood Risk"
        else:
            risk_class = "high"
            risk_label = "High Flood Risk"

        # Key contributing factors
        factors = []
        if features.get("rain_24h_mm", 0) > 100:
            factors.append("Extreme 24-hour monsoon rainfall accumulation")
        elif features.get("rain_24h_mm", 0) > 50:
            factors.append("Heavy 24-hour rainfall")

        if features.get("rain_1h_mm", 0) > 30:
            factors.append("Severe short-duration cloudburst intensity (>30mm/hr)")

        if features.get("elevation_m", 100) < 4.0:
            factors.append("Low-lying topographical depression (<4m elevation)")

        if features.get("slope_deg", 10) < 1.0:
            factors.append("Extremely flat drainage gradient (<1.0° slope)")

        if features.get("dist_water_m", 10000) < 300:
            factors.append("Close proximity to river or tidal creek (<300m)")

        if features.get("impervious_pct", 0) > 85:
            factors.append("High urban concrete imperviousness (>85%)")

        if features.get("drainage_index", 1) < 0.35:
            factors.append("Severely constrained municipal stormwater outfall capacity")

        if not factors:
            factors.append("Standard baseline hydrological conditions")

        now_iso = datetime.now().isoformat()
        return {
            "location_id": location_id or "custom-point",
            "location_name": location_name or "Custom Geographic Location",
            "risk_class": risk_class,
            "risk_label": risk_label,
            "estimated_probability": round(proba, 4),
            "binary_prediction": binary_pred,
            "probability_is_calibrated": True,
            "contributing_factors": factors,
            "model_version": self.metadata.get("model_version", "rf-v1.0"),
            "prediction_created_at": now_iso,
            "input_data_timestamp": now_iso,
            "warnings": [
                "Educational decision-support prototype only.",
                "Not an official emergency or evacuation warning.",
                "Consult IMD / MCGM disaster management for active emergencies.",
            ],
        }
