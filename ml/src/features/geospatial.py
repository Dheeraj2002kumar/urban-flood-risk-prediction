"""Geospatial helper utilities for spatial coordinates and risk zones."""
import math
from typing import Dict, Tuple

EARTH_RADIUS_KM = 6371.0

def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in metres."""
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c * 1000.0

def is_point_within_mumbai_bbox(lat: float, lon: float) -> bool:
    """Checks whether coordinates fall within Greater Mumbai bounding box."""
    # Bounding box roughly: Lat 18.89 to 19.35, Lon 72.75 to 73.05
    return 18.88 <= lat <= 19.38 and 72.75 <= lon <= 73.05
