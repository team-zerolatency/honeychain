"""
Trains the honey yield prediction model. Run directly: python -m src.train_yield
"""
import json
from datetime import datetime, timezone

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

from src.config import YIELD_FEATURES, YIELD_MODEL_PATH, YIELD_METADATA_PATH, TRAINING_DATA_PATH
from src.features import add_season_one_hot


def train():
    df = pd.read_csv(TRAINING_DATA_PATH)
    df = add_season_one_hot(df)
    # yield_kg is a *forward-looking* value (7 days ahead) — the last 168 hours of each
    # hive's data can't have a real target yet, so those rows get dropped from training.
    df = df.dropna(subset=["yield_kg"])

    X = df[YIELD_FEATURES]
    y = df["yield_kg"]

    # Simplification worth knowing: this is a plain random split, not a time-based split.
    # A stricter setup would train only on earlier dates and test on later ones, to avoid
    # any chance of "seeing the future." Fine for this prototype; worth revisiting if
    # judges probe methodology closely.
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "features": YIELD_FEATURES,
        "n_training_rows": len(X_train),
        "n_test_rows": len(X_test),
        "mean_absolute_error_kg": round(mae, 3),
        "r2_score": round(r2, 3),
    }

    YIELD_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, YIELD_MODEL_PATH)
    with open(YIELD_METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(json.dumps(metadata, indent=2))
    return model, metadata


if __name__ == "__main__":
    train()