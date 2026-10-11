"""Data preprocessing and leakage-free dataset split pipeline."""
from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd
from ml.src.features.build_features import ALL_MODEL_FEATURES, compute_engineered_features
from ml.src.utils.logging_config import setup_logger

logger = setup_logger("ml.data.preprocess")

def load_and_preprocess_data(
    file_path: str = "data/processed/mumbai_flood_features.csv",
    test_year: int = 2023,
    split_strategy: str = "temporal_and_spatial",
) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series, List[str]]:
    """Loads dataset, calculates engineered features, and splits into train and untouched test sets.

    Adheres to Section 13 Step 5 of README: Prevents data leakage by holding out the entire 2023
    monsoon period as an untouched test set, while training strictly on 2018-2022 data.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Processed dataset not found at {path}")

    df_raw = pd.read_csv(path)
    logger.info(f"Loaded {len(df_raw)} records from {path}")

    # Compute domain features
    df_feat = compute_engineered_features(df_raw)

    if split_strategy == "temporal_and_spatial":
        # Held-out untouched test set: Year 2023
        train_mask = df_feat["year"] < test_year
        test_mask = df_feat["year"] == test_year
    else:
        # Fallback random temporal split
        train_mask = df_feat["year"] < test_year
        test_mask = df_feat["year"] >= test_year

    X_train = df_feat.loc[train_mask, ALL_MODEL_FEATURES]
    y_train = df_feat.loc[train_mask, "flood_observed"]

    X_test = df_feat.loc[test_mask, ALL_MODEL_FEATURES]
    y_test = df_feat.loc[test_mask, "flood_observed"]

    logger.info(
        f"Train split (2018-{test_year-1}): {len(X_train)} samples, "
        f"flood rate: {y_train.mean():.3%}"
    )
    logger.info(
        f"Untouched Test split ({test_year}): {len(X_test)} samples, "
        f"flood rate: {y_test.mean():.3%}"
    )

    return X_train, y_train, X_test, y_test, ALL_MODEL_FEATURES
