"""
Combines every mapped dataset (data/mapped/*.csv) into the final training_data.csv.
Run after synthetic_data.py and any real mappers (ufc.py, hobos.py) have each produced
their output file.
"""
import pandas as pd
from src.config import MAPPED_DIR, PROCESSED_DIR, TRAINING_DATA_PATH
from src.data_mapping.common import add_derived_features


def combine():
    mapped_files = sorted(MAPPED_DIR.glob("*.csv"))
    if not mapped_files:
        raise FileNotFoundError(f"No mapped files in {MAPPED_DIR}. Run the mappers first.")

    frames = []
    for path in mapped_files:
        df = pd.read_csv(path, parse_dates=["timestamp"])
        frames.append(df)
        print(f"Loaded {path.name}: {len(df)} rows")

    combined = pd.concat(frames, ignore_index=True)
    combined = add_derived_features(combined)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    combined.to_csv(TRAINING_DATA_PATH, index=False)

    print(f"\nCombined total: {len(combined)} rows")
    print(combined["source"].value_counts())
    print(f"Saved -> {TRAINING_DATA_PATH}")
    return combined


if __name__ == "__main__":
    combine()