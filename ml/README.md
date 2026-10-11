# Machine Learning Pipeline

## Overview

This directory contains the training, evaluation, and inference code for the **Urban Flood Risk Prediction System**.

## Model Architectures Evaluated

1. **DummyClassifier (Reference Baseline):** Majority class predictor.
2. **Logistic Regression (Interpretable Linear Benchmark):** Balanced class weights with StandardScaler.
3. **Random Forest Classifier (Primary Production Pipeline):** 150 estimators, max depth 8, balanced class weighting.
4. **XGBoost Classifier (Candidate Comparison):** 120 gradient-boosted trees.

## Leakage-Free Temporal Splitting

- **Train Set (2018–2022):** 12,200 records.
- **Untouched Held-Out Test Set (2023):** 2,440 records.

## Usage

### Run Training and Benchmark Comparison
```bash
PYTHONPATH=. python ml/src/models/train.py
```

### Run ML Unit Tests
```bash
PYTHONPATH=. pytest ml/tests
```

### Inspect Output Artifacts
- Model Pipeline: `ml/artifacts/flood_risk_pipeline.joblib`
- Metadata: `ml/artifacts/model_metadata.json`
- Feature Schema: `ml/artifacts/feature_schema.json`
- Evaluation Metrics: `ml/reports/metrics/metrics.json`
- Comparison Report: `ml/reports/metrics/model_comparison.json`
- Figures: `ml/reports/figures/` (Confusion matrix and feature importance)
