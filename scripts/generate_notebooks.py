"""Script to generate all project Jupyter Notebooks (.ipynb) with structured markdown and code cells."""
import json
from pathlib import Path

def create_notebook(cells):
    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3",
            },
            "language_info": {
                "name": "python",
                "version": "3.12.0",
            },
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }

def md_cell(source):
    return {"cell_type": "markdown", "metadata": {}, "source": [line + "\n" for line in source.split("\n")]}

def code_cell(source):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" for line in source.split("\n")],
    }

def generate_notebooks():
    nb_dir = Path("notebooks")
    nb_dir.mkdir(parents=True, exist_ok=True)

    # 1. 01_data_exploration.ipynb
    nb1 = create_notebook([
        md_cell("# 01. Exploratory Data Analysis (EDA)\n## Urban Flood Risk Prediction — Greater Mumbai Pilot"),
        code_cell(
            "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n"
            "# Load processed dataset\ndf = pd.read_csv('../data/processed/mumbai_flood_features.csv')\n"
            "print(f'Shape: {df.shape}')\ndf.head()"
        ),
        code_cell(
            "# Summary statistics\ndf.describe()"
        ),
        code_cell(
            "# Class imbalance check\nprevalence = df['flood_observed'].value_counts(normalize=True)\n"
            "print('Flood label balance:\\n', prevalence)\n\n"
            "plt.figure(figsize=(6, 4))\nsns.countplot(data=df, x='flood_observed', palette='Blues')\n"
            "plt.title('Target Distribution (flood_observed)')\nplt.xlabel('Flood Observed (0 = No, 1 = Yes)')\nplt.show()"
        ),
        code_cell(
            "# Distribution of 24h Rainfall vs Elevation\nplt.figure(figsize=(8, 5))\n"
            "sns.scatterplot(data=df, x='rain_24h_mm', y='elevation_m', hue='flood_observed', alpha=0.6, palette={0: '#3b82f6', 1: '#ef4444'})\n"
            "plt.title('Rainfall vs Elevation Inundation Boundary')\nplt.show()"
        ),
    ])
    with open(nb_dir / "01_data_exploration.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb1, f, indent=2)

    # 2. 02_geospatial_exploration.ipynb
    nb2 = create_notebook([
        md_cell("# 02. Geospatial Exploration & Pilot Hotspots Analysis\n## Mumbai Pilot Monitoring Stations & Mithi River Basin"),
        code_cell(
            "import json\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n"
            "with open('../frontend/public/sample-area.geojson', 'r') as f:\n"
            "    geojson_data = json.load(f)\n\n"
            "print(f'Features in GeoJSON: {len(geojson_data[\"features\"])}')\n"
            "for feat in geojson_data['features'][:5]:\n"
            "    print(feat['properties']['location_id'], feat['properties']['location_name'], feat['properties']['elevation_m'])"
        ),
        code_cell(
            "# Plot station GPS coordinates across Mumbai\nlats = [f['properties']['center_latitude'] for f in geojson_data['features']]\n"
            "lons = [f['properties']['center_longitude'] for f in geojson_data['features']]\n"
            "elevs = [f['properties']['elevation_m'] for f in geojson_data['features']]\n\n"
            "plt.figure(figsize=(7, 9))\n"
            "scatter = plt.scatter(lons, lats, c=elevs, cmap='viridis_r', s=120, edgecolors='black')\n"
            "plt.colorbar(scatter, label='Elevation (m)')\n"
            "plt.title('Mumbai Pilot Monitoring Network Topography')\n"
            "plt.xlabel('Longitude')\nplt.ylabel('Latitude')\nplt.grid(True, linestyle='--', alpha=0.5)\nplt.show()"
        ),
    ])
    with open(nb_dir / "02_geospatial_exploration.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb2, f, indent=2)

    # 3. 03_feature_engineering.ipynb
    nb3 = create_notebook([
        md_cell("# 03. Feature Engineering & Hydrological Domain Transformations\n## Topographic Wetness, Antecedent Moisture & Flash Intensity"),
        code_cell(
            "import sys\nsys.path.insert(0, '..')\n"
            "import pandas as pd\nfrom ml.src.features.build_features import compute_engineered_features, ALL_MODEL_FEATURES\n\n"
            "raw_df = pd.read_csv('../data/sample/mumbai_flood_sample.csv')\n"
            "feat_df = compute_engineered_features(raw_df)\n"
            "print('Engineered features columns:', [c for c in ALL_MODEL_FEATURES if c not in raw_df.columns])\n"
            "feat_df[ALL_MODEL_FEATURES].head()"
        ),
        code_cell(
            "# Correlation matrix of features\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\n"
            "plt.figure(figsize=(10, 8))\n"
            "sns.heatmap(feat_df[ALL_MODEL_FEATURES].corr(), cmap='coolwarm', annot=True, fmt='.2f', vmin=-1, vmax=1)\n"
            "plt.title('Inter-Feature Correlation Matrix')\nplt.tight_layout()\nplt.show()"
        ),
    ])
    with open(nb_dir / "03_feature_engineering.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb3, f, indent=2)

    # 4. 04_model_experiments.ipynb
    nb4 = create_notebook([
        md_cell("# 04. Model Experiments & Benchmark Comparison\n## Temporal Split: Train on 2018-2022, Evaluate on Untouched 2023 Season"),
        code_cell(
            "import json\nimport pandas as pd\n\n"
            "with open('../ml/reports/metrics/model_comparison.json', 'r') as f:\n"
            "    comp = json.load(f)\n\n"
            "comp_df = pd.DataFrame(comp)\n"
            "comp_df[['model_name', 'precision', 'recall', 'f1_score', 'pr_auc', 'accuracy']]"
        ),
        code_cell(
            "# Inspect saved model metadata and feature importance\n"
            "with open('../ml/artifacts/model_metadata.json', 'r') as f:\n"
            "    meta = json.load(f)\n\n"
            "print(f'Model version: {meta[\"model_version\"]}')\n"
            "print(f'Training samples: {meta[\"train_samples\"]}, Test samples: {meta[\"test_samples\"]}')\n"
            "pd.DataFrame(meta['feature_importances'])"
        ),
    ])
    with open(nb_dir / "04_model_experiments.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb4, f, indent=2)

    print("Successfully generated all 4 Jupyter notebooks.")

if __name__ == "__main__":
    generate_notebooks()
