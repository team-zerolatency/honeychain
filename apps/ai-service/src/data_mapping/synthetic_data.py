"""
Generates a synthetic multi-hive sensor dataset in Honey Chain's standard training schema:
timestamp, hive_id, temperature, humidity, weight, weight_change, acoustic_features,
season, label, yield_kg

`label` (0=normal, 1=anomaly) is only meaningful here because we control the generation —
real-world datasets won't have this column, and that's fine: Isolation Forest doesn't need
labels to train. We use `label` purely to *evaluate* the trained model afterward.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from src.config import PROCESSED_DIR

RNG_SEED = 42
HIVE_IDS = [f"SIM-HIVE-{i}" for i in range(1, 6)]
DAYS = 90
READINGS_PER_DAY = 24  # one per hour
ANOMALY_RATE = 0.03

MONTH_TO_SEASON = {
    12: "winter", 1: "winter", 2: "winter",
    3: "spring", 4: "spring", 5: "spring",
    6: "summer", 7: "summer", 8: "summer",
    9: "autumn", 10: "autumn", 11: "autumn",
}


def generate_hive_series(hive_id: str, rng: np.random.Generator, start: datetime) -> pd.DataFrame:
    n = DAYS * READINGS_PER_DAY
    timestamps = [start + timedelta(hours=i) for i in range(n)]
    hour_of_day = np.array([t.hour for t in timestamps])
    day_index = np.arange(n) / READINGS_PER_DAY

    # Daily temperature cycle (cooler at night, warmer midday) + slow seasonal drift + noise
    daily_cycle = 4 * np.sin((hour_of_day - 6) / 24 * 2 * np.pi)
    seasonal_drift = 3 * np.sin(day_index / DAYS * 2 * np.pi)
    temperature = 34 + daily_cycle + seasonal_drift + rng.normal(0, 0.5, n)

    humidity = 58 - 0.3 * daily_cycle + rng.normal(0, 2, n)
    humidity = np.clip(humidity, 30, 90)

    # Weight: slow nectar-accumulation growth, with 2-3 harvest events (sudden drops)
    weight = np.zeros(n)
    weight[0] = 38.0
    harvest_days = sorted(rng.choice(range(20, DAYS - 5), size=3, replace=False))
    for i in range(1, n):
        growth = rng.normal(0.01, 0.005)  # slow steady gain per hour
        current_day = i // READINGS_PER_DAY
        if current_day in harvest_days and i % READINGS_PER_DAY == 8:  # harvest happens once, at hour 8
            growth -= rng.uniform(4, 7)  # a real harvest removes several kg at once
        weight[i] = weight[i - 1] + growth

    acoustic = 0.4 + 0.3 * np.sin((hour_of_day - 8) / 24 * 2 * np.pi) + rng.normal(0, 0.05, n)
    acoustic = np.clip(acoustic, 0, 1)

    label = np.zeros(n, dtype=int)
    n_anomalies = int(n * ANOMALY_RATE)
    anomaly_idx = rng.choice(n, size=n_anomalies, replace=False)
    for idx in anomaly_idx:
        kind = rng.choice(["temp_spike", "weight_crash", "silence"])
        if kind == "temp_spike":
            temperature[idx] += rng.uniform(8, 14)
        elif kind == "weight_crash":
            weight[idx] -= rng.uniform(2, 5)
        else:  # silence — hive suddenly goes quiet, a real disease/absconding signal
            acoustic[idx] = rng.uniform(0, 0.05)
        label[idx] = 1

    return pd.DataFrame({
        "timestamp": timestamps,
        "hive_id": hive_id,
        "temperature": temperature,
        "humidity": humidity,
        "weight": weight,
        "acoustic_features": acoustic,
        "label": label,
    })


def generate_all() -> pd.DataFrame:
    rng = np.random.default_rng(RNG_SEED)
    start = datetime(2026, 1, 1)
    frames = [generate_hive_series(hive_id, rng, start) for hive_id in HIVE_IDS]
    df = pd.concat(frames, ignore_index=True)

    df = df.sort_values(["hive_id", "timestamp"]).reset_index(drop=True)
    df["weight_change"] = df.groupby("hive_id")["weight"].diff().fillna(0)
    df["season"] = df["timestamp"].dt.month.map(MONTH_TO_SEASON)

    # yield_kg: forward-looking 7-day (168-hour) cumulative weight gain per hive.
    # This is our chosen proxy target for "how much honey will this hive produce next" —
    # every dataset has weight+timestamp, so this definition works regardless of source.
    df["yield_kg"] = (
        df.groupby("hive_id")["weight"]
        .transform(lambda s: s.shift(-168) - s)
    )

    return df


if __name__ == "__main__":
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df = generate_all()
    out_path = PROCESSED_DIR / "training_data.csv"
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} rows across {df['hive_id'].nunique()} hives -> {out_path}")
    print(f"Known anomaly rate: {df['label'].mean():.2%}")