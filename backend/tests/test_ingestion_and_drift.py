"""Test ingestion and drift monitoring endpoints."""
import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app

@pytest.mark.anyio
async def test_ingestion_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/ingestion/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["scheduler_running"] is True
    assert len(data["feeds"]) >= 3
    feed_ids = [f["id"] for f in data["feeds"]]
    assert "imd_radar" in feed_ids
    assert "copernicus_cds" in feed_ids

@pytest.mark.anyio
async def test_ingestion_trigger():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/ingestion/trigger")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["records_processed"] > 0
    assert "synced_at" in data

@pytest.mark.anyio
async def test_drift_report():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/drift/report")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "feature_drift" in data
    assert len(data["feature_drift"]) >= 6
    assert data["drifted_features_count"] == 0
    assert data["data_quality"]["missing_value_pct"] == 0.0
