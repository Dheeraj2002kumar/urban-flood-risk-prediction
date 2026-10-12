"""API router for model drift and data-quality drift monitoring."""
from fastapi import APIRouter
from backend.app.services.drift_service import DriftService

router = APIRouter(prefix="/drift", tags=["Model & Data Drift Monitoring"])

@router.get("/report")
async def get_drift_report():
    """Returns PSI feature drift scores, prediction distribution stability, and data quality metrics."""
    service = DriftService.get_instance()
    return service.get_drift_report()
