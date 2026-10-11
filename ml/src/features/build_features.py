"""Feature engineering module for urban flood risk prediction."""
from typing import List
import numpy as np
import pandas as pd

CORE_RAW_FEATURES: List[str] = [
    "rain_1h_mm",
    "rain_24h_mm",
    "rain_72h_mm",
    "elevation_m",
    "slope_deg",
    "dist_water_m",
    "impervious_pct",
    "drainage_index",
]

ENGINEERED_FEATURES: List[str] = [
    "rain_intensity_ratio",
    "antecedent_saturation_mm",
    "topographic_wetness_proxy",
    "water_proximity_factor",
    "drainage_deficit",
]

ALL_MODEL_FEATURES: List[str] = CORE_RAW_FEATURES + ENGINEERED_FEATURES

def compute_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """Computes physically grounded hydrological interaction features from raw attributes."""
    df_feat = df.copy()

    # 1. Flash rain intensity ratio: proportion of 24h rain concentrated in the peak 1h
    df_feat["rain_intensity_ratio"] = df_feat["rain_1h_mm"] / (df_feat["rain_24h_mm"] + 1e-4)

    # 2. Antecedent saturation proxy: precipitation in the 48 hours prior to the current 24-hour window
    df_feat["antecedent_saturation_mm"] = np.maximum(0.0, df_feat["rain_72h_mm"] - df_feat["rain_24h_mm"])

    # 3. Topographical wetness proxy: high imperviousness on low, flat terrain accumulates water
    df_feat["topographic_wetness_proxy"] = (
        (df_feat["impervious_pct"] / 100.0)
        / (np.maximum(df_feat["elevation_m"], 0.5) * np.maximum(df_feat["slope_deg"], 0.2))
    )

    # 4. Water body proximity vulnerability factor
    df_feat["water_proximity_factor"] = 1000.0 / (df_feat["dist_water_m"] + 100.0)

    # 5. Drainage deficit: unmitigated impervious area with low drainage capacity
    df_feat["drainage_deficit"] = (1.0 - df_feat["drainage_index"]) * (df_feat["impervious_pct"] / 100.0)

    return df_feat
