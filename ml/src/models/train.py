"""Model training and evaluation pipeline for Urban Flood Risk Prediction.

Implements baseline DummyClassifier, LogisticRegression, RandomForestClassifier,
and candidate XGBoostClassifier with leakage-free temporal splitting.
Saves the versioned production pipeline and evaluation reports.
"""

from datetime import datetime
import json
from pathlib import Path
from typing import Any, Dict, List
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except Exception:
    from sklearn.ensemble import HistGradientBoostingClassifier as XGBClassifier
    HAS_XGB = False

from ml.src.data.preprocess import load_and_preprocess_data
from ml.src.models.evaluate import evaluate_classification_model
from ml.src.utils.config import load_yaml_config
from ml.src.utils.logging_config import setup_logger

logger = setup_logger("ml.models.train")

def plot_feature_importance(
    pipeline: Pipeline,
    feature_names: List[str],
    output_path: str = "ml/reports/figures/feature_importance.png",
) -> List[Dict[str, Any]]:
    """Plots and returns feature importances from the tree model."""
    classifier = pipeline.named_steps["classifier"]
    if hasattr(classifier, "feature_importances_"):
        importances = classifier.feature_importances_
    elif hasattr(classifier, "coef_"):
        importances = np.abs(classifier.coef_[0])
    else:
        return []

    sorted_indices = np.argsort(importances)[::-1]
    sorted_features = [feature_names[i] for i in sorted_indices]
    sorted_scores = [float(importances[i]) for i in sorted_indices]

    plt.figure(figsize=(9, 5))
    bars = plt.barh(sorted_features[::-1], sorted_scores[::-1], color="#2563eb")
    plt.xlabel("Gini Importance Score")
    plt.title("Random Forest Feature Importances for Urban Flood Risk")
    plt.tight_layout()
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_path, dpi=150)
    plt.close()

    result = [
        {"feature": feat, "importance": round(score, 4)}
        for feat, score in zip(sorted_features, sorted_scores)
    ]
    return result

def train_and_compare_models(config_path: str = "ml/configs/baseline.yaml") -> Dict[str, Any]:
    """Trains and rigorously evaluates baseline and candidate ML models."""
    config = load_yaml_config(config_path)
    logger.info("Starting model training and evaluation workflow...")

    processed_path = config["data"]["processed_path"]
    test_year = config["training"].get("test_event_year", 2023)
    split_strategy = config["training"].get("split_strategy", "temporal_and_spatial")

    # Load leakage-free temporal split
    X_train, y_train, X_test, y_test, feature_names = load_and_preprocess_data(
        file_path=processed_path,
        test_year=test_year,
        split_strategy=split_strategy,
    )

    models_comparison = []

    # 1. Dummy Classifier (Majority Class Reference Baseline)
    logger.info("Training 1/4: DummyClassifier baseline...")
    dummy_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", DummyClassifier(strategy="most_frequent")),
    ])
    dummy_pipe.fit(X_train, y_train)
    dummy_metrics = evaluate_classification_model(
        dummy_pipe, X_test, y_test, model_name="Dummy_Baseline", figures_dir=config["paths"]["figures_dir"]
    )
    models_comparison.append(dummy_metrics)

    # 2. Logistic Regression (Linear Benchmark)
    logger.info("Training 2/4: LogisticRegression benchmark...")
    lr_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)),
    ])
    lr_pipe.fit(X_train, y_train)
    lr_metrics = evaluate_classification_model(
        lr_pipe, X_test, y_test, model_name="Logistic_Regression", figures_dir=config["paths"]["figures_dir"]
    )
    models_comparison.append(lr_metrics)

    # 3. Random Forest (Target Baseline Pipeline)
    logger.info("Training 3/4: RandomForestClassifier baseline...")
    rf_params = config["training"]["rf_params"]
    rf_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(**rf_params)),
    ])
    rf_pipe.fit(X_train, y_train)
    rf_metrics = evaluate_classification_model(
        rf_pipe, X_test, y_test, model_name="Random_Forest", figures_dir=config["paths"]["figures_dir"]
    )
    models_comparison.append(rf_metrics)

    # 4. XGBoost / Gradient Boosting (Candidate Model)
    logger.info("Training 4/4: Boosting candidate...")
    xgb_params = config["training"]["xgb_params"]
    if HAS_XGB:
        candidate_model = XGBClassifier(eval_metric="logloss", **xgb_params)
        model_label = "XGBoost"
    else:
        candidate_model = XGBClassifier(random_state=42, max_iter=xgb_params.get("n_estimators", 100))
        model_label = "Gradient_Boosting"

    xgb_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", candidate_model),
    ])
    xgb_pipe.fit(X_train, y_train)
    xgb_metrics = evaluate_classification_model(
        xgb_pipe, X_test, y_test, model_name=model_label, figures_dir=config["paths"]["figures_dir"]
    )
    models_comparison.append(xgb_metrics)

    # Generate Feature Importance for the Random Forest pipeline
    feat_importances = plot_feature_importance(
        rf_pipe,
        feature_names,
        output_path=f"{config['paths']['figures_dir']}/feature_importance.png",
    )

    # Save artifacts
    artifact_path = Path(config["paths"]["artifact_path"])
    artifact_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(rf_pipe, artifact_path)
    logger.info(f"Saved primary production pipeline to {artifact_path}")

    # Save model metadata
    model_version = f"rf-v1.0-{datetime.now().strftime('%Y%m%d')}"
    metadata = {
        "model_version": model_version,
        "algorithm": "RandomForestClassifier",
        "pilot_region": config["data"]["pilot_region"],
        "created_at": datetime.now().isoformat(),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "train_years": "2018-2022",
        "held_out_test_year": test_year,
        "features": feature_names,
        "feature_importances": feat_importances,
        "thresholds": config["thresholds"],
        "primary_metrics": rf_metrics,
        "limitations": [
            "Educational decision-support prototype; not an official emergency early-warning system.",
            "Valid specifically for Greater Mumbai pilot locations under monsoon meteorological regimes.",
            "Predictions assume functioning regional pump stations and open storm nullahs.",
        ],
    }

    metadata_path = Path(config["paths"]["metadata_path"])
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Saved model metadata to {metadata_path}")

    # Save feature schema
    schema = {
        "feature_names": feature_names,
        "required_raw_features": config["data"]["feature_cols"],
        "engineered_features": [f for f in feature_names if f not in config["data"]["feature_cols"]],
        "feature_ranges": {
            "rain_1h_mm": [0.0, 250.0],
            "rain_24h_mm": [0.0, 750.0],
            "rain_72h_mm": [0.0, 1500.0],
            "elevation_m": [0.5, 60.0],
            "slope_deg": [0.1, 45.0],
            "dist_water_m": [10.0, 20000.0],
            "impervious_pct": [10.0, 99.0],
            "drainage_index": [0.05, 0.95],
        },
    }
    schema_path = Path(config["paths"]["schema_path"])
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)
    logger.info(f"Saved feature schema to {schema_path}")

    # Save metrics JSON files
    metrics_path = Path(config["paths"]["metrics_path"])
    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(rf_metrics, f, indent=2)

    comp_path = Path(config["paths"]["comparison_path"])
    with open(comp_path, "w", encoding="utf-8") as f:
        json.dump(models_comparison, f, indent=2)
    logger.info(f"Saved model comparison report to {comp_path}")

    return {
        "status": "success",
        "model_version": model_version,
        "rf_metrics": rf_metrics,
        "comparison": models_comparison,
    }

if __name__ == "__main__":
    train_and_compare_models()
