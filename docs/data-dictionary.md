# Data Dictionary

## Model Features & Target Schema

| Field Name | Type | Physical Unit | Permitted Range | Description |
|---|---|---|---|---|
| `location_id` | string | ID code | e.g. `MUM-KURLA-01` | Unique stable station/pocket identifier |
| `location_name` | string | Text | N/A | Human-readable name of the monitoring station |
| `latitude` | float | Decimal degrees | `18.88` to `19.38` | WGS84 Latitude coordinate |
| `longitude` | float | Decimal degrees | `72.75` to `73.05` | WGS84 Longitude coordinate |
| `event_time` | string | ISO 8601 | `YYYY-MM-DDTHH:MM:SSZ` | Observation timestamp |
| `rain_1h_mm` | float | Millimetres (mm) | `0.0` to `300.0` | Peak 1-hour rainfall preceding observation |
| `rain_24h_mm` | float | Millimetres (mm) | `0.0` to `1000.0` | Cumulative 24-hour rainfall |
| `rain_72h_mm` | float | Millimetres (mm) | `0.0` to `2000.0` | Cumulative 72-hour rainfall determining ground saturation |
| `elevation_m` | float | Metres (m) | `-5.0` to `500.0` | Elevation above mean sea level |
| `slope_deg` | float | Degrees (°) | `0.0` to `90.0` | Terrain gradient slope |
| `dist_water_m` | float | Metres (m) | `0.0` to `50000.0` | Euclidean distance to nearest mapped water body / tidal outlet |
| `impervious_pct` | float | Percentage (%) | `0.0` to `100.0` | Proportion of concrete/asphalt preventing surface infiltration |
| `drainage_index` | float | Index (0–1) | `0.0` to `1.0` | Local stormwater outfall and pump capacity index (1 = optimal) |
| `flood_observed` | integer | Binary (0 / 1) | `0` or `1` | Historical inundation ground-truth target |
| `risk_class` | string | Category | `low` / `medium` / `high` | Operational display risk classification |

## Derived Domain Features

| Engineered Feature | Formula | Rationale |
|---|---|---|
| `rain_intensity_ratio` | `rain_1h_mm / (rain_24h_mm + 1e-4)` | Distinguishes acute flash cloudbursts from prolonged steady rain |
| `antecedent_saturation_mm` | `rain_72h_mm - rain_24h_mm` | Measures ground soil moisture prior to the active 24h storm event |
| `topographic_wetness_proxy` | `(impervious_pct / 100) / (elevation_m * slope_deg)` | Quantifies stormwater runoff accumulation in flat, low concrete basins |
| `water_proximity_factor` | `1000.0 / (dist_water_m + 100.0)` | Models tidal backflow vulnerability and estuarine overflow proximity |
| `drainage_deficit` | `(1.0 - drainage_index) * (impervious_pct / 100.0)` | Quantifies unmitigated stormwater accumulation burden |
