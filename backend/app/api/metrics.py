"""Model information and evaluation metrics endpoints."""
from typing import Any, Dict
from fastapi import APIRouter
from backend.app.services.model_service import ModelService

router = APIRouter(tags=["Metrics & Model Info"])

@router.get("/model-info")
async def get_model_info():
    """Returns active model version, parameters, training samples, and limitations."""
    model_service = ModelService.get_instance()
    return model_service.get_model_info()

@router.get("/metrics")
async def get_metrics():
    """Returns published evaluation metrics on held-out test data (precision, recall, F1, PR-AUC)."""
    model_service = ModelService.get_instance()
    return model_service.get_metrics()

@router.get("/metrics/comparison")
async def get_model_comparison():
    """Returns side-by-side comparison across Dummy, Logistic Regression, Random Forest, and XGBoost."""
    model_service = ModelService.get_instance()
    return model_service.get_comparison()
