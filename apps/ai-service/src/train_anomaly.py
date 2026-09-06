"""
Trains the hive anomaly detection model. Run directly: python -m src.train_anomaly
"""
import json
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import precision_score, recall_score, f1_score

from src.config import ANOMALY_FEATURES, ANOMALY_MODEL_PATH, ANOMALY_METADATA_PATH, TRAINING_DATA_PATH


def build_pipeline() -> Pipeline:
    return Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
        ("model", IsolationForest(
            n_estimators=200,
            contamination=0.05,  # our best guess at "what fraction of real readings are anomalous"
            random_state=42,
        )),
    ])


def evaluate_against_known_labels(pipeline: Pipeline, X: pd.DataFrame, y_true: pd.Series) -> dict:
    """Only possible because our synthetic data knows ground truth. On real unlabeled
    data later, you'd skip this and instead spot-check flagged anomalies manually."""
    raw_predictions = pipeline.predict(X)  # -1 = anomaly, 1 = normal
    y_pred = (raw_predictions == -1).astype(int)
    return {
        "precision": round(precision_score(y_true, y_pred, zero_division=0), 3),
        "recall": round(recall_score(y_true, y_pred, zero_division=0), 3),
        "f1": round(f1_score(y_true, y_pred, zero_division=0), 3),
        "flagged_count": int(y_pred.sum()),
        "true_anomaly_count": int(y_true.sum()),
    }


def train():
    df = pd.read_csv(TRAINING_DATA_PATH)
    X = df[ANOMALY_FEATURES]
    y_true = df["label"] if "label" in df.columns else None

    pipeline = build_pipeline()
    pipeline.fit(X)

    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "features": ANOMALY_FEATURES,
        "n_training_rows": len(df),
        "contamination": 0.05,
    }
    if y_true is not None:
        metadata["evaluation_against_known_labels"] = evaluate_against_known_labels(pipeline, X, y_true)

    ANOMALY_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, ANOMALY_MODEL_PATH)
    with open(ANOMALY_METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(json.dumps(metadata, indent=2))
    return pipeline, metadata


if __name__ == "__main__":
    train()