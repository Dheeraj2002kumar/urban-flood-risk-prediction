"""Model evaluation module implementing precision, recall, F1, PR-AUC, ROC-AUC, and figures."""
from pathlib import Path
from typing import Any, Dict
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from ml.src.utils.logging_config import setup_logger

logger = setup_logger("ml.models.evaluate")

def evaluate_classification_model(
    model: Any,
    X_test: np.ndarray,
    y_test: np.ndarray,
    model_name: str = "RandomForest",
    figures_dir: str = "ml/reports/figures",
) -> Dict[str, Any]:
    """Calculates all key metrics on held-out test data and saves evaluation plots."""
    y_pred = model.predict(X_test)
    y_proba = None
    if hasattr(model, "predict_proba"):
        y_proba = model.predict_proba(X_test)[:, 1]

    # Metrics
    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    acc = float(accuracy_score(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred).tolist()

    roc_auc = float(roc_auc_score(y_test, y_proba)) if y_proba is not None else None
    pr_auc = float(average_precision_score(y_test, y_proba)) if y_proba is not None else None
    brier = float(brier_score_loss(y_test, y_proba)) if y_proba is not None else None

    # Save figures
    fig_path = Path(figures_dir)
    fig_path.mkdir(parents=True, exist_ok=True)

    # 1. Confusion Matrix Plot
    plt.figure(figsize=(5, 4))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=["No Flood", "Flood"],
        yticklabels=["No Flood", "Flood"],
    )
    plt.title(f"{model_name} Confusion Matrix (2023 Test Split)")
    plt.ylabel("Actual Observed")
    plt.xlabel("Model Predicted")
    plt.tight_layout()
    cm_file = fig_path / f"confusion_matrix_{model_name.lower()}.png"
    plt.savefig(cm_file, dpi=150)
    plt.close()

    metrics = {
        "model_name": model_name,
        "test_samples": int(len(y_test)),
        "flood_prevalence_pct": float(np.mean(y_test) * 100.0),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "accuracy": round(acc, 4),
        "pr_auc": round(pr_auc, 4) if pr_auc is not None else None,
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
        "brier_score": round(brier, 4) if brier is not None else None,
        "confusion_matrix": cm,
        "confusion_matrix_plot": str(cm_file),
    }

    logger.info(
        f"[{model_name}] Precision: {precision:.4f} | Recall: {recall:.4f} | "
        f"F1: {f1:.4f} | PR-AUC: {pr_auc if pr_auc else 0:.4f}"
    )

    return metrics
