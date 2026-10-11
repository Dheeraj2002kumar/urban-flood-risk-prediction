"""Service for querying Mumbai pilot areas, GeoJSON polygons, and rainfall time series."""
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import pandas as pd
from backend.app.core.config import settings
from backend.app.core.logging_config import get_app_logger
from backend.app.schemas.prediction import AreaSummary, RainfallHistoryItem

logger = get_app_logger("backend.area_service")

class AreaService:
    _instance: Optional["AreaService"] = None

    def __init__(self):
        self.areas_cache: Dict[str, AreaSummary] = {}
        self.geojson_data: Optional[Dict[str, Any]] = None
        self._load_areas()

    @classmethod
    def get_instance(cls) -> "AreaService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_areas(self):
        geojson_path = Path(settings.GEOJSON_PATH)
        if geojson_path.exists():
            with open(geojson_path, "r", encoding="utf-8") as f:
                self.geojson_data = json.load(f)
                for feat in self.geojson_data.get("features", []):
                    props = feat.get("properties", {})
                    loc_id = props.get("location_id")
                    if loc_id:
                        self.areas_cache[loc_id] = AreaSummary(
                            location_id=loc_id,
                            location_name=props.get("location_name", loc_id),
                            zone=props.get("zone", "Greater Mumbai"),
                            latitude=props.get("center_latitude", 19.0),
                            longitude=props.get("center_longitude", 72.8),
                            elevation_m=props.get("elevation_m", 5.0),
                            slope_deg=props.get("slope_deg", 1.0),
                            dist_water_m=props.get("dist_water_m", 500.0),
                            impervious_pct=props.get("impervious_pct", 80.0),
                            drainage_index=props.get("drainage_index", 0.4),
                            description=props.get("description", ""),
                        )
            logger.info(f"Loaded {len(self.areas_cache)} pilot areas from GeoJSON.")

    def list_areas(self) -> List[AreaSummary]:
        return list(self.areas_cache.values())

    def get_area(self, location_id: str) -> Optional[AreaSummary]:
        return self.areas_cache.get(location_id)

    def get_geojson(self) -> Optional[Dict[str, Any]]:
        return self.geojson_data

    def get_rainfall_history(self, location_id: str, limit: int = 14) -> List[RainfallHistoryItem]:
        """Retrieves recent monsoon time series records for the area from processed dataset."""
        data_path = Path(settings.PROCESSED_DATA_PATH)
        if not data_path.exists():
            return []

        try:
            df = pd.read_csv(data_path)
            loc_df = df[df["location_id"] == location_id].tail(limit)
            results = []
            for _, row in loc_df.iterrows():
                results.append(
                    RainfallHistoryItem(
                        date=str(row["event_time"])[:10],
                        rain_1h_mm=float(row["rain_1h_mm"]),
                        rain_24h_mm=float(row["rain_24h_mm"]),
                        rain_72h_mm=float(row["rain_72h_mm"]),
                        flood_observed=int(row["flood_observed"]),
                    )
                )
            return results
        except Exception as e:
            logger.error(f"Error reading rainfall history for {location_id}: {e}")
            return []
