"""Health check endpoint."""
from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.schemas.common import HealthResponse
from backend.app.services.model_service import ModelService

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Returns basic service health and ML pipeline status."""
    model_service = ModelService.get_instance()
    model_version = None
    if model_service.is_loaded and model_service.predictor:
        model_version = model_service.predictor.metadata.get("model_version")

    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        model_loaded=model_service.is_loaded,
        model_version=model_version,
        environment=settings.ENVIRONMENT,
    )
