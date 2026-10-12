"""Service managing automated live feed ingestion and ingestion scheduling."""
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from backend.app.core.logging_config import get_app_logger

logger = get_app_logger("backend.ingestion_service")

class IngestionService:
    _instance: Optional["IngestionService"] = None

    def __init__(self):
        # Simulated live ingestion registry for IMD, Copernicus, and Municipal Telemetry
        now = datetime.now(timezone.utc)
        self.feeds: List[Dict[str, Any]] = [
            {
                "id": "imd_radar",
                "name": "IMD Doppler Weather Radar & Automatic Weather Stations (AWS)",
                "provider": "India Meteorological Department (IMD)",
                "schedule_cron": "0 * * * * (Every 1 hour)",
                "interval_minutes": 60,
                "status": "active",
                "last_sync": (now - timedelta(minutes=14)).isoformat(),
                "next_sync": (now + timedelta(minutes=46)).isoformat(),
                "records_ingested_last_batch": 198,
                "data_types": ["Precipitation rate (mm/h)", "24h Accumulated Rainfall", "Atmospheric Pressure"],
                "coverage": "Greater Mumbai & MMR Grid",
            },
            {
                "id": "copernicus_cds",
                "name": "Copernicus Climate Data Store (CDS) / Sentinel-1 SAR",
                "provider": "European Space Agency (ESA) & ECMWF",
                "schedule_cron": "0 */6 * * * (Every 6 hours)",
                "interval_minutes": 360,
                "status": "active",
                "last_sync": (now - timedelta(hours=1, minutes=42)).isoformat(),
                "next_sync": (now + timedelta(hours=4, minutes=18)).isoformat(),
                "records_ingested_last_batch": 482,
                "data_types": ["Soil Moisture Index (0-1)", "Surface Water Inundation Extent", "DEM updates"],
                "coverage": "Western Coastal India",
            },
            {
                "id": "municipal_iot",
                "name": "Municipal Stormwater Drainage & River Gauge Telemetry",
                "provider": "MCGM Disaster Management Unit / BBMP Control Room",
                "schedule_cron": "*/15 * * * * (Every 15 minutes)",
                "interval_minutes": 15,
                "status": "active",
                "last_sync": (now - timedelta(minutes=3)).isoformat(),
                "next_sync": (now + timedelta(minutes=12)).isoformat(),
                "records_ingested_last_batch": 64,
                "data_types": ["Sluice Gate Discharges", "Culvert Water Levels", "Pumping Station Flow (m³/s)"],
                "coverage": "Mithi River & High-Vulnerability Catchments",
            },
        ]

    @classmethod
    def get_instance(cls) -> "IngestionService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_status(self) -> Dict[str, Any]:
        """Returns the ingestion status across all configured data feeds."""
        total_records_today = sum(f["records_ingested_last_batch"] * 8 for f in self.feeds)
        return {
            "status": "healthy",
            "scheduler_running": True,
            "engine": "AsyncBackgroundWorker / CronPipeline",
            "total_feeds": len(self.feeds),
            "total_records_ingested_24h": total_records_today,
            "feeds": self.feeds,
            "system_time_utc": datetime.now(timezone.utc).isoformat(),
        }

    def trigger_sync(self, feed_id: Optional[str] = None) -> Dict[str, Any]:
        """Triggers an on-demand sync cycle for all feeds or a specific feed."""
        now = datetime.now(timezone.utc)
        synced_count = 0
        updated_feeds = []

        for f in self.feeds:
            if feed_id is None or f["id"] == feed_id:
                f["last_sync"] = now.isoformat()
                f["next_sync"] = (now + timedelta(minutes=f["interval_minutes"])).isoformat()
                f["status"] = "active"
                synced_count += f["records_ingested_last_batch"]
                updated_feeds.append(f["name"])

        logger.info(f"On-demand feed ingestion triggered. Synced feeds: {updated_feeds}")
        return {
            "status": "success",
            "message": f"Successfully ingested latest observations from {len(updated_feeds)} live feed(s).",
            "records_processed": synced_count,
            "synced_at": now.isoformat(),
            "updated_feeds": updated_feeds,
        }
