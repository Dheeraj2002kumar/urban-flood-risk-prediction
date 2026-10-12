"""API router for live data ingestion scheduling and telemetry."""
from typing import Optional
from fastapi import APIRouter, Query
from backend.app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/ingestion", tags=["Data Feeds & Ingestion"])

@router.get("/status")
async def get_ingestion_status():
    """Returns status and schedules of automated IMD, Copernicus, and Municipal data feeds."""
    service = IngestionService.get_instance()
    return service.get_status()

@router.post("/trigger")
async def trigger_ingestion_sync(feed_id: Optional[str] = Query(None, description="Optional specific feed ID to sync")):
    """Triggers an on-demand sync cycle across configured live feeds."""
    service = IngestionService.get_instance()
    return service.trigger_sync(feed_id=feed_id)
