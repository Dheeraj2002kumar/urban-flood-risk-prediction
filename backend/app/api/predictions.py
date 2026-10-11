"""Prediction endpoints for single and batch urban flood risk scoring."""
from typing import List
from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.prediction import (
    BatchPredictionRequest,
    BatchPredictionResponse,
    PredictionRequest,
    PredictionResponse,
)
from backend.app.services.model_service import ModelService

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
async def predict_flood_risk(request: PredictionRequest):
    """Predicts urban flood risk category and estimated probability for a single location record."""
    model_service = ModelService.get_instance()
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifact is not loaded or missing. Please ensure the pipeline is trained.",
        )

    try:
        raw_dict = request.features.model_dump()
        result = model_service.predict(
            features=raw_dict,
            location_id=request.location_id,
            location_name=request.location_name,
        )
        return PredictionResponse(**result)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction execution error: {str(e)}",
        )

@router.post("/batch", response_model=BatchPredictionResponse, status_code=status.HTTP_200_OK)
async def predict_flood_risk_batch(request: BatchPredictionRequest):
    """Bounded batch prediction for up to 50 location feature records."""
    model_service = ModelService.get_instance()
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifact is not loaded.",
        )

    predictions: List[PredictionResponse] = []
    for item in request.items:
        try:
            raw_dict = item.features.model_dump()
            res = model_service.predict(
                features=raw_dict,
                location_id=item.location_id,
                location_name=item.location_name,
            )
            predictions.append(PredictionResponse(**res))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Error evaluating location {item.location_id}: {str(e)}",
            )

    return BatchPredictionResponse(
        total_count=len(predictions),
        predictions=predictions,
    )
