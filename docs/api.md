# REST API Reference

The Urban Flood Risk Prediction service is built with FastAPI. Interactive OpenAPI documentation is accessible at `http://127.0.0.1:8000/docs`.

## Base URL
- Local: `http://127.0.0.1:8000`
- API Prefix: `/api/v1`

---

### 1. Health Check
`GET /health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "Urban Flood Risk Prediction API",
  "version": "1.0.0",
  "model_loaded": true,
  "model_version": "rf-v1.0-20261011",
  "environment": "development"
}
```

---

### 2. Single Risk Prediction
`POST /api/v1/predictions`

**Request Body:**
```json
{
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
    "drainage_index": 0.25
  }
}
```

**Response (200 OK):**
```json
{
  "prediction_id": "c1f7a075-81fa-4ff7-b6f4-a034293f94ec",
  "location_id": "MUM-KURLA-01",
  "location_name": "Kurla West (Mithi River Basin)",
  "risk_class": "high",
  "risk_label": "High Flood Risk",
  "estimated_probability": 0.998,
  "binary_prediction": 1,
  "probability_is_calibrated": true,
  "contributing_factors": [
    "Extreme 24-hour monsoon rainfall accumulation",
    "Severe short-duration cloudburst intensity (>30mm/hr)",
    "Low-lying topographical depression (<4m elevation)",
    "Extremely flat drainage gradient (<1.0° slope)",
    "Close proximity to river or tidal creek (<300m)",
    "High urban concrete imperviousness (>85%)",
    "Severely constrained municipal stormwater outfall capacity"
  ],
  "model_version": "rf-v1.0-20261011",
  "prediction_created_at": "2026-10-11T13:20:13.422349",
  "warnings": [
    "Educational decision-support prototype only.",
    "Not an official emergency or evacuation warning.",
    "Consult IMD / MCGM disaster management for active emergencies."
  ]
}
```

---

### 3. Batch Risk Predictions
`POST /api/v1/predictions/batch`
Bounded batch request accepting 1 to 50 locations.

---

### 4. Pilot Areas & Geospatial Layers
- `GET /api/v1/areas`: Lists all 20 pilot stations with topographical baseline attributes.
- `GET /api/v1/areas/{location_id}`: Retrieves single station baseline.
- `GET /api/v1/areas/geojson`: Returns GeoJSON polygons and markers for Leaflet overlays.
- `GET /api/v1/areas/{location_id}/rainfall-history`: Returns recent daily rainfall observations.

---

### 5. Model Evaluation & Benchmarks
- `GET /api/v1/model-info`: Active model metadata, parameters, and limitations.
- `GET /api/v1/metrics`: Evaluation metrics on untouched 2023 test set.
- `GET /api/v1/metrics/comparison`: Side-by-side comparison across Dummy baseline, Logistic Regression, Random Forest, and XGBoost.
