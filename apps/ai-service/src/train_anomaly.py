"""
Trains the hive anomaly detection model. Run directly: python -m src.train_anomaly
"""
import json
from datetime import datetime, timezone

import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split

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


def _complete_rows(df: pd.DataFrame) -> pd.DataFrame:
    """Keep rows that represent one complete live sensor reading."""
    return df.dropna(subset=ANOMALY_FEATURES)


def _training_rows(df: pd.DataFrame) -> pd.DataFrame:
    """Use complete normal rows when labels exist; otherwise use complete rows."""
    complete = _complete_rows(df)
    if "label" not in complete.columns:
        return complete

    labeled = complete[complete["label"].notna()]
    if len(labeled) > 0:
        return complete[complete["label"].isna() | (complete["label"] == 0)]
    return complete


def train():
    df = pd.read_csv(TRAINING_DATA_PATH)

    complete = _complete_rows(df)
    labeled = complete[complete["label"].notna()] if "label" in complete.columns else pd.DataFrame()

    if len(labeled) >= 2 and labeled["label"].nunique() > 1:
        fit_labeled, evaluation_labeled = train_test_split(
            labeled,
            test_size=0.25,
            random_state=42,
            stratify=labeled["label"],
        )
        fit_source = pd.concat([
            complete[complete["label"].isna()],
            fit_labeled[fit_labeled["label"] == 0],
        ], ignore_index=True)
    else:
        fit_source = _training_rows(df)
        evaluation_labeled = pd.DataFrame()

    pipeline = build_pipeline()
    pipeline.fit(fit_source[ANOMALY_FEATURES])

    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "features": ANOMALY_FEATURES,
        "n_training_rows": len(df),
        "n_complete_rows": len(complete),
        "n_model_training_rows": len(fit_source),
        "contamination": 0.05,
        "source_breakdown": df["source"].value_counts().to_dict() if "source" in df.columns else None,
    }

    if len(evaluation_labeled) > 0:
        metadata["evaluation_against_known_labels"] = evaluate_against_known_labels(
            pipeline,
            evaluation_labeled[ANOMALY_FEATURES],
            evaluation_labeled["label"],
        )
        metadata["evaluation_note"] = (
            f"Evaluated on a held-out set of {len(evaluation_labeled)} complete labeled rows; "
            "known anomalies were excluded from model fitting."
        )
    else:
        metadata["evaluation_note"] = "No held-out labeled rows available for evaluation."

    ANOMALY_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, ANOMALY_MODEL_PATH)
    with open(ANOMALY_METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(json.dumps(metadata, indent=2))
    return pipeline, metadata


if __name__ == "__main__":
    train()