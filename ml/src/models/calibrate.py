"""Probability calibration module for urban flood risk models."""
from typing import Any
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss
from ml.src.utils.logging_config import setup_logger

logger = setup_logger("ml.models.calibrate")

def calibrate_classifier(
    estimator: Any,
    X_val: Any,
    y_val: Any,
    method: str = "isotonic",
) -> CalibratedClassifierCV:
    """Calibrates predicted probabilities using Isotonic regression on validation data."""
    calibrated = CalibratedClassifierCV(estimator=estimator, method=method, cv="prefit")
    calibrated.fit(X_val, y_val)
    
    brier_before = brier_score_loss(y_val, estimator.predict_proba(X_val)[:, 1])
    brier_after = brier_score_loss(y_val, calibrated.predict_proba(X_val)[:, 1])
    logger.info(f"Calibration Brier score: before={brier_before:.4f}, after={brier_after:.4f}")
    return calibrated
