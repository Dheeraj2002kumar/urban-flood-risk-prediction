"""Unit tests for feature engineering computations."""
import pandas as pd
import pytest
from ml.src.features.build_features import (
    ALL_MODEL_FEATURES,
    CORE_RAW_FEATURES,
    ENGINEERED_FEATURES,
    compute_engineered_features,
)

def test_feature_columns_structure():
    assert len(CORE_RAW_FEATURES) == 8
    assert len(ENGINEERED_FEATURES) == 5
    assert len(ALL_MODEL_FEATURES) == 13

def test_compute_engineered_features_values():
    sample_df = pd.DataFrame([
        {
            "rain_1h_mm": 50.0,
            "rain_24h_mm": 200.0,
            "rain_72h_mm": 350.0,
            "elevation_m": 2.5,
            "slope_deg": 0.5,
            "dist_water_m": 150.0,
            "impervious_pct": 90.0,
            "drainage_index": 0.25,
        }
    ])
    feat_df = compute_engineered_features(sample_df)

    # Test rain intensity ratio
    expected_intensity = 50.0 / (200.0 + 1e-4)
    assert pytest.approx(feat_df["rain_intensity_ratio"].iloc[0], 0.001) == expected_intensity

    # Test antecedent saturation
    assert feat_df["antecedent_saturation_mm"].iloc[0] == 150.0

    # Test water proximity factor
    expected_prox = 1000.0 / (150.0 + 100.0)
    assert pytest.approx(feat_df["water_proximity_factor"].iloc[0], 0.001) == expected_prox

    # Test drainage deficit
    expected_deficit = (1.0 - 0.25) * 0.90
    assert pytest.approx(feat_df["drainage_deficit"].iloc[0], 0.001) == expected_deficit
