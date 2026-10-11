"""Configuration loader for YAML ML configuration."""
from pathlib import Path
from typing import Any, Dict
import yaml

def load_yaml_config(config_path: str = "ml/configs/baseline.yaml") -> Dict[str, Any]:
    """Loads a YAML configuration file from disk."""
    path = Path(config_path)
    if not path.is_absolute():
        # resolve relative to repo root if possible
        repo_root = Path(__file__).resolve().parents[3]
        candidate = repo_root / config_path
        if candidate.exists():
            path = candidate

    if not path.exists():
        raise FileNotFoundError(f"Configuration file not found at: {path}")

    with open(path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    return config
