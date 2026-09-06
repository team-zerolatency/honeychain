"""
Maps the UFC (Federal University of Ceará) apiary dataset into our standard base schema.
Source columns, per the dataset's own data dictionary:
  time, id, id_sensor, temperature, humidity, weight, ext_temperature, ext_humidity[, voltage]
We group by (file, id_sensor) -> hive_id, since a file could in principle contain more
than one physical sensor under different id_sensor values. ext_temperature/ext_humidity/
voltage aren't part of our schema and are intentionally dropped. UFC has no microphone,
so acoustic_features is left NaN — the anomaly model's median imputer (Phase 17, Part D)
already handles missing features gracefully, exactly for cases like this.
"""
import pandas as pd
from src.config import RAW_DIR, MAPPED_DIR
from src.data_mapping.common import BASE_SCHEMA, validate_base_schema

UFC_DIR = RAW_DIR / "ufc"

FILES = {
    "dadosColmeia1Apis.csv": "UFC-APIS-1",
    "dadosColmeia2Apis.csv": "UFC-APIS-2",
    # Meliponini (stingless bees) — a genuinely different species than the Apis mellifera
    # honey bees Honey Chain targets, but structurally identical sensor readings, so
    # included for extra training volume. Drop this file if you'd rather train only on
    # true Apis mellifera data.
    "DadosMeliponas.csv": "UFC-MELIPONAS",
}


def map_ufc() -> pd.DataFrame:
    frames = []
    for filename, hive_prefix in FILES.items():
        path = UFC_DIR / filename
        if not path.exists():
            print(f"[ufc] WARNING: {path} not found, skipping.")
            continue

        raw = pd.read_csv(path)
        raw["timestamp"] = pd.to_datetime(raw["time"], format="mixed")
        raw["hive_id"] = hive_prefix + "-S" + raw["id_sensor"].astype(str)

        mapped = pd.DataFrame({
            "timestamp": raw["timestamp"],
            "hive_id": raw["hive_id"],
            "temperature": raw["temperature"],
            "humidity": raw["humidity"],
            "weight": raw["weight"],
            "acoustic_features": pd.NA,
            "label": pd.NA,  # real data — no known ground-truth anomaly labels
            "source": "ufc",
        })
        mapped = mapped.dropna(subset=["timestamp", "temperature", "humidity", "weight"])
        frames.append(mapped)

    if not frames:
        raise FileNotFoundError(f"No UFC files found under {UFC_DIR} — check placement.")

    df = pd.concat(frames, ignore_index=True)[BASE_SCHEMA]
    validate_base_schema(df, "ufc")
    return df


if __name__ == "__main__":
    MAPPED_DIR.mkdir(parents=True, exist_ok=True)
    df = map_ufc()
    out_path = MAPPED_DIR / "ufc.csv"
    df.to_csv(out_path, index=False)
    print(f"Saved -> {out_path}")