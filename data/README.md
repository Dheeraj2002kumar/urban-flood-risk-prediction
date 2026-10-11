# Data Management & Provenance

This directory stores raw, intermediate, processed, and sample datasets for the **Urban Flood Risk Prediction System (Mumbai Pilot)**.

## Structure

- `raw/`: Unprocessed source files (excluded from Git).
- `interim/`: Intermediate spatial merges, cleaning artifacts, and alignments.
- `processed/`: Final model-ready feature table (`mumbai_flood_features.csv`).
- `sample/`: Small demonstration sample table (`mumbai_flood_sample.csv`).

## Study Region

- **Pilot Region:** Greater Mumbai Metropolitan Area (Mithi River Basin, Island City & Suburban Wards).
- **Locations:** 20 chronic waterlogging hotspots and monitoring stations.
- **Coverage Period:** 2018–2023 Monsoon Seasons (June 1 to September 30 annually).
- **Target Variable:** `flood_observed` (binary integer 0 or 1, calibrated against historical deluge events and hydrological vulnerability).

## Data Quality Rules

1. Units: Rainfall in millimetres (mm), elevation in metres (m), slope in degrees (°), distance to water in metres (m), impervious surface in percent (0–100%).
2. Coordinate Reference System: WGS84 (`EPSG:4326`) for geographic markers and GeoJSON.
3. No Data Leakage: Split is strictly temporal/spatial. 2018–2022 used for training; 2023 held out as an untouched test set.
4. Validation: Run `python scripts/validate_data.py` to ensure schema conformance and physical range constraints.
