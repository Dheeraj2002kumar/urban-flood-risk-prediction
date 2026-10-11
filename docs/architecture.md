# System Architecture

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Data & Pipeline
        A[Historical IMD Rainfall & Copernicus DEM] --> B[Data Cleaning & Bounds Validation]
        B --> C[Hydrological Feature Engineering]
        C --> D[Leakage-Free Temporal Split: 2018-2022 Train vs 2023 Test]
        D --> E[Model Benchmarking: Dummy vs LR vs RF vs XGBoost]
        E --> F[Fitted Model Pipeline & Artifact Export]
    end

    subgraph Backend Service
        F --> G[FastAPI Service (app.main)]
        H[(GeoJSON & Pilot Hotspots Cache)] --> G
        G --> I[Pydantic Request Validation]
        I --> J[Predictor Pipeline]
        J --> K[Prediction Response & Contributing Factors]
    end

    subgraph Frontend Application
        L[React + TypeScript + Vite Dashboard] --> G
        L --> M[Leaflet Interactive Geospatial Map]
        L --> N[Recharts Time-Series & Metrics Visualizations]
        L --> O[Simulation Scenario Controls]
    end
```

## Architectural Principles

1. **Offline Training, Fast Online Inference:** Models are trained offline and serialized into versioned Scikit-learn pipelines with standard scalers. The API serves predictions with sub-50ms latency.
2. **Defensible Leakage-Free Splitting:** Cross-validation and evaluation strictly avoid temporal leakage by holding out the entire 2023 monsoon season.
3. **Robust Input Validation:** Pydantic models validate input ranges, physical non-negativity, and consistency rules (e.g. `rain_72h >= rain_24h >= rain_1h`).
4. **Decoupled Geospatial Presentation:** Standard GeoJSON layers allow rendering on Leaflet maps without tight coupling to GIS backend engines.
5. **Human-Centred Responsible Use:** All model responses include contributing factors, uncertainty disclosures, and disclaimers emphasizing that the tool is an educational prototype.
