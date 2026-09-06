"""
Turns the raw standard-schema columns into the exact numeric feature matrix each model
expects. Kept separate from training scripts so both training and live inference
(Part F) use the exact same transformation — a very common source of ML bugs is
computing features slightly differently at train time vs. serve time.
"""
import pandas as pd
from src.config import YIELD_FEATURES

SEASONS = ["winter", "spring", "summer", "autumn"]


def add_season_one_hot(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for season in SEASONS:
        df[f"season_{season}"] = (df["season"] == season).astype(int)
    return df


def build_yield_feature_row(reading: dict, season: str) -> list[float]:
    """Builds one feature row, in the exact column order the yield model expects,
    from a single live reading (used at inference time, not training time)."""
    one_hot = {f"season_{s}": (1.0 if season == s else 0.0) for s in SEASONS}
    values = {
        "temperature": reading["temperature"],
        "humidity": reading["humidity"],
        "weight": reading["weight"],
        "weight_change": reading["weight_change"],
        **one_hot,
    }
    return [values[col] for col in YIELD_FEATURES]