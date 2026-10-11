"""Pilot areas and geospatial metadata endpoints."""
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.prediction import AreaSummary, RainfallHistoryItem
from backend.app.services.area_service import AreaService

router = APIRouter(prefix="/areas", tags=["Areas & Geospatial"])

@router.get("", response_model=List[AreaSummary])
async def list_supported_areas():
    """Lists all pilot monitoring locations across Greater Mumbai with baseline features."""
    service = AreaService.get_instance()
    return service.list_areas()

@router.get("/geojson")
async def get_pilot_geojson():
    """Returns GeoJSON FeatureCollection for Leaflet map overlay."""
    service = AreaService.get_instance()
    geojson_data = service.get_geojson()
    if not geojson_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GeoJSON layer data not found.",
        )
    return geojson_data

@router.get("/{location_id}", response_model=AreaSummary)
async def get_area_detail(location_id: str):
    """Returns baseline metadata and topographical attributes for a specific area."""
    service = AreaService.get_instance()
    area = service.get_area(location_id)
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pilot area '{location_id}' not found in study region.",
        )
    return area

@router.get("/{location_id}/rainfall-history", response_model=List[RainfallHistoryItem])
async def get_rainfall_history(location_id: str):
    """Returns historical daily rainfall time series records for charting."""
    service = AreaService.get_instance()
    area = service.get_area(location_id)
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Area '{location_id}' not found.",
        )
    return service.get_rainfall_history(location_id)
