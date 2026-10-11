"""Dataset validation module according to Data Quality Rules (Section 12 of README)."""
from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd
from ml.src.utils.logging_config import setup_logger

logger = setup_logger("ml.data.validate")

REQUIRED_COLUMNS = [
    "location_id",
    "location_name",
    "latitude",
    "longitude",
    "event_time",
    "rain_1h_mm",
    "rain_24h_mm",
    "rain_72h_mm",
    "elevation_m",
    "slope_deg",
    "dist_water_m",
    "impervious_pct",
    "drainage_index",
    "flood_observed",
    "risk_class",
]

# Validation bounds
BOUNDS = {
    "latitude": (18.5, 19.5),       # Mumbai metropolitan region bounds
    "longitude": (72.5, 73.2),
    "rain_1h_mm": (0.0, 300.0),
    "rain_24h_mm": (0.0, 1000.0),
    "rain_72h_mm": (0.0, 2000.0),
    "elevation_m": (-5.0, 500.0),
    "slope_deg": (0.0, 90.0),
    "dist_water_m": (0.0, 50000.0),
    "impervious_pct": (0.0, 100.0),
    "drainage_index": (0.0, 1.0),
    "flood_observed": (0, 1),
}

def validate_dataframe(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    """Validates dataframe columns, types, missing values, duplicates, and physical bounds."""
    errors = []

    # 1. Check required columns
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns: {missing_cols}")

    # 2. Check nulls
    null_counts = df[REQUIRED_COLUMNS].isnull().sum().to_dict()
    has_nulls = {k: v for k, v in null_counts.items() if v > 0}
    if has_nulls:
        errors.append(f"Found unexpected null values in columns: {has_nulls}")

    # 3. Check duplicates
    if "location_id" in df.columns and "event_time" in df.columns:
        dups = df.duplicated(subset=["location_id", "event_time"]).sum()
        if dups > 0:
            errors.append(f"Found {dups} duplicate (location_id, event_time) rows.")

    # 4. Check physical bounds
    for col, (low, high) in BOUNDS.items():
        if col in df.columns:
            out_of_bounds = df[(df[col] < low) | (df[col] > high)]
            if len(out_of_bounds) > 0:
                errors.append(
                    f"Column '{col}' has {len(out_of_bounds)} values outside valid range [{low}, {high}]."
                )

    # 5. Logical consistency: rain_72h >= rain_24h >= rain_1h
    if "rain_72h_mm" in df.columns and "rain_24h_mm" in df.columns:
        inconsistent_24_72 = df[df["rain_24h_mm"] > df["rain_72h_mm"] + 1e-4]
        if len(inconsistent_24_72) > 0:
            errors.append(f"{len(inconsistent_24_72)} rows have rain_24h > rain_72h.")

    if "rain_24h_mm" in df.columns and "rain_1h_mm" in df.columns:
        inconsistent_1_24 = df[df["rain_1h_mm"] > df["rain_24h_mm"] + 1e-4]
        if len(inconsistent_1_24) > 0:
            errors.append(f"{len(inconsistent_1_24)} rows have rain_1h > rain_24h.")

    is_valid = len(errors) == 0
    return is_valid, errors

def validate_dataset_file(file_path: str = "data/processed/mumbai_flood_features.csv") -> bool:
    """Reads and validates a CSV dataset file."""
    p = Path(file_path)
    if not p.exists():
        logger.error(f"Dataset file does not exist: {p}")
        return False

    df = pd.read_csv(p)
    logger.info(f"Loaded {len(df)} rows from {p} for validation.")
    is_valid, errors = validate_dataframe(df)

    if is_valid:
        logger.info(f"Dataset {p} passed all validation checks successfully.")
        return True
    else:
        for err in errors:
            logger.error(f"Validation Error: {err}")
        return False

if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "data/processed/mumbai_flood_features.csv"
    success = validate_dataset_file(path)
    sys.exit(0 if success else 1)
