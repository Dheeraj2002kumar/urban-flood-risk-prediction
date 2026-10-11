"""Test prediction endpoints including validation and errors."""
import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app

VALID_FEATURE_PAYLOAD = {
    "location_id": "MUM-KURLA-01",
    "location_name": "Kurla West (Mithi River Basin)",
    "features": {
        "rain_1h_mm": 55.0,
        "rain_24h_mm": 190.0,
        "rain_72h_mm": 320.0,
        "elevation_m": 3.2,
        "slope_deg": 0.8,
        "dist_water_m": 120.0,
        "impervious_pct": 88.5,
        "drainage_index": 0.25,
    },
}

@pytest.mark.anyio
async def test_predict_flood_risk_valid():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/predictions", json=VALID_FEATURE_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert "prediction_id" in data
    assert data["location_id"] == "MUM-KURLA-01"
    assert data["risk_class"] in ["low", "medium", "high"]
    assert data["estimated_probability"] is not None
    assert isinstance(data["contributing_factors"], list)
    assert len(data["warnings"]) > 0

@pytest.mark.anyio
async def test_predict_flood_risk_invalid_rainfall_order():
    # rain_1h > rain_24h should fail validation
    payload = {
        "location_id": "MUM-KURLA-01",
        "features": {
            "rain_1h_mm": 100.0,
            "rain_24h_mm": 50.0,
            "rain_72h_mm": 120.0,
            "elevation_m": 3.2,
            "slope_deg": 0.8,
            "dist_water_m": 120.0,
            "impervious_pct": 88.5,
            "drainage_index": 0.25,
        },
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/predictions", json=payload)
    assert response.status_code == 422

@pytest.mark.anyio
async def test_predict_batch():
    batch_payload = {
        "items": [
            VALID_FEATURE_PAYLOAD,
            {
                "location_id": "MUM-MALABAR-17",
                "location_name": "Malabar Hill Ridge",
                "features": {
                    "rain_1h_mm": 5.0,
                    "rain_24h_mm": 25.0,
                    "rain_72h_mm": 40.0,
                    "elevation_m": 46.5,
                    "slope_deg": 12.8,
                    "dist_water_m": 380.0,
                    "impervious_pct": 62.0,
                    "drainage_index": 0.89,
                },
            },
        ]
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/predictions/batch", json=batch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 2
    assert len(data["predictions"]) == 2
