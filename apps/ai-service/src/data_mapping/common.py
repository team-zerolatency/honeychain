"""
Shared helpers used by every dataset mapper and by combine.py. Every mapper below
produces an identical base shape; combine.py then computes derived features
(season, weight_change, yield_kg) exactly once, uniformly, regardless of source.
"""
import pandas as pd

BASE_SCHEMA = ["timestamp", "hive_id", "temperature", "humidity", "weight", "acoustic_features", "label", "source"]

MONTH_TO_SEASON = {
    12: "winter", 1: "winter", 2: "winter",
    3: "spring", 4: "spring", 5: "spring",
    6: "summer", 7: "summer", 8: "summer",
    9: "autumn", 10: "autumn", 11: "autumn",
}


def validate_base_schema(df: pd.DataFrame, source_name: str) -> None:
    missing = [c for c in BASE_SCHEMA if c not in df.columns]
    if missing:
        raise ValueError(f"[{source_name}] mapped output is missing required columns: {missing}")
    if df["timestamp"].isna().any():
        raise ValueError(f"[{source_name}] found unparsed timestamps (NaT) — check the date format used.")
    print(f"[{source_name}] OK — {len(df)} rows, {df['hive_id'].nunique()} hive_id(s): {sorted(df['hive_id'].unique())}")


def add_yield_target(df: pd.DataFrame, horizon_days: int = 7, tolerance_days: int = 2) -> pd.DataFrame:
    """Time-based forward-looking yield target: for each row, finds that hive's weight
    reading closest to (timestamp + horizon_days), within a tolerance window, and sets
    yield_kg = future weight - current weight.

    Deliberately time-based rather than a fixed row-count shift: our synthetic data logs
    hourly, but real sensor logs (UFC, HOBOS) may log at a completely different interval.
    A fixed "168 rows ahead" would silently mean something different (and wrong) in each
    dataset — this was a real bug in Phase 17's original synthetic-only version that only
    happened to work there because synthetic data is exactly hourly.
    """
    horizon = pd.Timedelta(days=horizon_days)
    tolerance = pd.Timedelta(days=tolerance_days)
    df = df.sort_values(["hive_id", "timestamp"]).reset_index(drop=True)
    df["yield_kg"] = pd.NA

    for hive_id, group in df.groupby("hive_id"):
        group = group.sort_values("timestamp")
        future = group[["timestamp", "weight"]].rename(columns={"timestamp": "target_time", "weight": "future_weight"})
        lookup = pd.DataFrame({"timestamp": group["timestamp"], "target_time": group["timestamp"] + horizon})
        merged = pd.merge_asof(
            lookup.sort_values("target_time"), future.sort_values("target_time"),
            on="target_time", direction="forward", tolerance=tolerance,
        )
        current_weight = group.set_index("timestamp")["weight"]
        yields = merged.set_index("timestamp")["future_weight"] - current_weight.reindex(merged["timestamp"]).values
        df.loc[group.index, "yield_kg"] = yields.reindex(group["timestamp"]).values

    return df


def add_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(["hive_id", "timestamp"]).reset_index(drop=True)
    df["weight_change"] = df.groupby("hive_id")["weight"].diff().fillna(0)
    df["season"] = df["timestamp"].dt.month.map(MONTH_TO_SEASON)
    df = add_yield_target(df)
    return df