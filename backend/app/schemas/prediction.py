"""Pydantic schemas for flood risk predictions and pilot areas."""
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, model_validator

class FeatureInputs(BaseModel):
    rain_1h_mm: float = Field(
        ...,
        ge=0.0,
        le=300.0,
        description="Rainfall total during preceding 1 hour in millimetres",
        examples=[45.0],
    )
    rain_24h_mm: float = Field(
        ...,
        ge=0.0,
        le=1000.0,
        description="Rainfall total during preceding 24 hours in millimetres",
        examples=[180.0],
    )
    rain_72h_mm: float = Field(
        ...,
        ge=0.0,
        le=2000.0,
        description="Rainfall total during preceding 72 hours in millimetres",
        examples=[310.0],
    )
    elevation_m: float = Field(
        ...,
        ge=-5.0,
        le=500.0,
        description="Ground elevation above sea level in metres",
        examples=[2.8],
    )
    slope_deg: float = Field(
        ...,
        ge=0.0,
        le=90.0,
        description="Terrain surface slope in degrees",
        examples=[0.8],
    )
    dist_water_m: float = Field(
        ...,
        ge=0.0,
        le=50000.0,
        description="Distance to nearest water body (river, creek, sea) in metres",
        examples=[140.0],
    )
    impervious_pct: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Impervious concrete/asphalt surface percentage (0-100)",
        examples=[89.0],
    )
    drainage_index: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Stormwater drainage capacity index (0.0 to 1.0, higher is better)",
        examples=[0.25],
    )

    @model_validator(mode="after")
    def validate_rainfall_consistency(self):
        if self.rain_1h_mm > self.rain_24h_mm:
            raise ValueError(
                f"1-hour rainfall ({self.rain_1h_mm} mm) cannot exceed 24-hour rainfall ({self.rain_24h_mm} mm)."
            )
        if self.rain_24h_mm > self.rain_72h_mm:
            raise ValueError(
                f"24-hour rainfall ({self.rain_24h_mm} mm) cannot exceed 72-hour rainfall ({self.rain_72h_mm} mm)."
            )
        return self

class PredictionRequest(BaseModel):
    location_id: str = Field(
        ...,
        min_length=2,
        max_length=64,
        description="Pilot area identifier or grid coordinate ID",
        examples=["MUM-KURLA-01"],
    )
    location_name: Optional[str] = Field(
        None,
        description="Human-readable name of the location",
        examples=["Kurla West (Mithi River Basin)"],
    )
    features: FeatureInputs

class PredictionResponse(BaseModel):
    prediction_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    location_name: str
    risk_class: str = Field(description="Low / Medium / High modelled risk classification")
    risk_label: str
    estimated_probability: Optional[float] = Field(
        None, description="Calibrated flood occurrence probability (0.0 to 1.0)"
    )
    binary_prediction: int = Field(description="0 (no flood expected) or 1 (flood risk alert)")
    probability_is_calibrated: bool = True
    contributing_factors: List[str]
    model_version: str
    prediction_created_at: str
    input_data_timestamp: Optional[str] = None
    warnings: List[str]

class BatchPredictionRequest(BaseModel):
    items: List[PredictionRequest] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Bounded batch of locations to predict (up to 50 locations)",
    )

class BatchPredictionResponse(BaseModel):
    total_count: int
    predictions: List[PredictionResponse]

class AreaSummary(BaseModel):
    location_id: str
    location_name: str
    zone: str
    latitude: float
    longitude: float
    elevation_m: float
    slope_deg: float
    dist_water_m: float
    impervious_pct: float
    drainage_index: float
    description: str

class RainfallHistoryItem(BaseModel):
    date: str
    rain_1h_mm: float
    rain_24h_mm: float
    rain_72h_mm: float
    flood_observed: int
