"""
Maps HOBOS Beehive Metrics into our standard base schema. HOBOS ships one file per
metric, wide format (timestamp column + one column per hive station). This melts each
file to long format and merges the metrics together on (timestamp, hive_id).

IMPORTANT: run this and READ the printed preview before trusting the output. Known
gotchas with this class of German-origin dataset — if you see either of these, tell me
exactly what printed and I'll fix the parsing precisely rather than guessing further:
  - If all your data lands in ONE column instead of several: the file is
    semicolon-delimited, not comma. Add `sep=";"` to the pd.read_csv call below.
  - If dates look scrambled (e.g. month/day swapped): try `dayfirst=True` in the
    pd.to_datetime call below.
"""
import pandas as pd
from src.config import RAW_DIR, MAPPED_DIR
from src.data_mapping.common import BASE_SCHEMA, validate_base_schema

HOBOS_DIR = RAW_DIR / "hobos"

METRIC_FILES = {
    "temperature": "temperature_2017.csv",
    "humidity": "humidity_2017.csv",
    "weight": "weight_2017.csv",
    # flow_2017.csv (bee flow/activity) isn't in our schema — none of our two models use
    # it, so it's intentionally left unmapped.
}


def _melt_metric_file(path, metric_name: str) -> pd.DataFrame:
    raw = pd.read_csv(path)  # add sep=";" here if the semicolon gotcha above applies
    print(f"\n--- {path.name} ---")
    print("columns:", list(raw.columns))
    print(raw.head(3))

    timestamp_col = raw.columns[0]  # assumed — confirm against the printed columns above
    hive_columns = [c for c in raw.columns if c != timestamp_col]

    long_df = raw.melt(id_vars=[timestamp_col], value_vars=hive_columns,
                        var_name="hive_id", value_name="_metric_value")
    long_df = long_df.rename(columns={timestamp_col: "timestamp", "_metric_value": metric_name})
    long_df["timestamp"] = pd.to_datetime(long_df["timestamp"], errors="coerce")  # add dayfirst=True if needed
    long_df["hive_id"] = "HOBOS-" + long_df["hive_id"].astype(str).str.strip()
    return long_df.dropna(subset=["timestamp"])


def map_hobos() -> pd.DataFrame:
    metric_frames = {}
    for metric, filename in METRIC_FILES.items():
        path = HOBOS_DIR / filename
        if not path.exists():
            print(f"[hobos] WARNING: {path} not found, skipping {metric}.")
            continue
        metric_frames[metric] = _melt_metric_file(path, metric)

    if not metric_frames:
        raise FileNotFoundError(f"No HOBOS files found under {HOBOS_DIR} — check placement.")

    df = metric_frames.get("temperature", pd.DataFrame(columns=["timestamp", "hive_id"]))
    for metric in ["humidity", "weight"]:
        if metric in metric_frames:
            df = df.merge(metric_frames[metric], on=["timestamp", "hive_id"], how="outer")

    df["acoustic_features"] = pd.NA
    df["label"] = pd.NA
    df["source"] = "hobos"
    df = df.reindex(columns=BASE_SCHEMA)
    validate_base_schema(df, "hobos")
    return df


if __name__ == "__main__":
    MAPPED_DIR.mkdir(parents=True, exist_ok=True)
    df = map_hobos()
    out_path = MAPPED_DIR / "hobos.csv"
    df.to_csv(out_path, index=False)
    print(f"Saved -> {out_path}")