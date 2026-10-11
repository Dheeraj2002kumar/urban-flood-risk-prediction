"""Unit tests for preprocessing and data splitting."""
from pathlib import Path
import pytest
from ml.src.data.preprocess import load_and_preprocess_data
from ml.src.data.validate import validate_dataframe

def test_load_and_preprocess_data_splits():
    sample_file = "data/sample/mumbai_flood_sample.csv"
    if not Path(sample_file).exists():
        pytest.skip("Sample dataset file not generated yet")

    X_train, y_train, X_test, y_test, features = load_and_preprocess_data(
        file_path="data/processed/mumbai_flood_features.csv",
        test_year=2023,
    )

    assert len(X_train) > 0
    assert len(X_test) > 0
    assert len(X_train) + len(X_test) == 14640
    assert len(y_train) == len(X_train)
    assert len(y_test) == len(X_test)
    assert len(features) == 13

    # Ensure no NaN values in features
    assert not X_train.isnull().any().any()
    assert not X_test.isnull().any().any()
