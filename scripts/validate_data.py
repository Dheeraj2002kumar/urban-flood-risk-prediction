#!/usr/bin/env python3
"""CLI utility to validate processed datasets."""
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ml.src.data.validate import validate_dataset_file

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "data/processed/mumbai_flood_features.csv"
    success = validate_dataset_file(target)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
