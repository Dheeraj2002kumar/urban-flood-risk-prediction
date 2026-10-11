# Model Card: Urban Flood Risk Prediction Pipeline

## Model Details
- **Model Name:** Mumbai Urban Flood Risk Prediction Baseline
- **Model Version:** `rf-v1.0`
- **Model Type:** Scikit-learn Pipeline (`StandardScaler` + `RandomForestClassifier`)
- **Candidate Comparison:** XGBoost Classifier (`XGBClassifier`)
- **Release Date:** October 2026
- **License:** MIT License

## Intended Use
- **Primary Use:** Educational decision-support prototype exploring how terrain, imperviousness, drainage, and rainfall features interact to influence relative urban waterlogging vulnerability.
- **Intended Users:** Climate resilience researchers, urban planning students, civic data scientists.
- **Out-of-Scope Use:** MUST NOT be used as the sole basis for official emergency evacuation orders, operational search-and-rescue dispatch, or life-safety municipal decisions.

## Factors & Features
- Input variables include 8 raw features (`rain_1h_mm`, `rain_24h_mm`, `rain_72h_mm`, `elevation_m`, `slope_deg`, `dist_water_m`, `impervious_pct`, `drainage_index`) and 5 engineered domain transformations (`rain_intensity_ratio`, `antecedent_saturation_mm`, `topographic_wetness_proxy`, `water_proximity_factor`, `drainage_deficit`).

## Metrics (Held-Out Untouched 2023 Monsoon Test Set)
- **Precision:** 60.7%
- **Recall (Sensitivity):** 91.0%
- **F1-Score:** 0.728
- **PR-AUC:** 0.888
- **ROC-AUC:** 0.982
- **Prevalence:** 10.9% (rare event classification under heavy deluge conditions)

## Ethical Considerations & Limitations
- Models represent statistical associations, not dynamic hydraulic flow simulations (e.g. 2D hydrodynamic Euler models).
- Predictions depend on standard functioning of municipal pump stations.
- Extreme cloudbursts exceeding 100mm/hr can overwhelm localized street-level storm drains even in moderately elevated zones.
