import numpy as np
import pandas as pd
from src.train_anomaly import build_pipeline, evaluate_against_known_labels
from src.config import ANOMALY_FEATURES


def make_fixture_data():
    rng = np.random.default_rng(0)
    n_normal = 200
    normal = pd.DataFrame({
        "temperature": rng.normal(34, 1, n_normal),
        "humidity": rng.normal(55, 3, n_normal),
        "weight": rng.normal(40, 0.5, n_normal),
        "weight_change": rng.normal(0.01, 0.01, n_normal),
        "acoustic_features": rng.normal(0.5, 0.05, n_normal),
        "label": 0,
    })
    n_anomaly = 20
    anomaly = pd.DataFrame({
        "temperature": rng.normal(50, 2, n_anomaly),  # clearly out of normal range
        "humidity": rng.normal(55, 3, n_anomaly),
        "weight": rng.normal(30, 1, n_anomaly),
        "weight_change": rng.normal(-3, 0.5, n_anomaly),
        "acoustic_features": rng.normal(0.5, 0.05, n_anomaly),
        "label": 1,
    })
    return pd.concat([normal, anomaly], ignore_index=True)


def test_pipeline_flags_obvious_anomalies_with_reasonable_recall():
    df = make_fixture_data()
    pipeline = build_pipeline()
    X = df[ANOMALY_FEATURES]
    pipeline.fit(X)

    metrics = evaluate_against_known_labels(pipeline, X, df["label"])
    assert metrics["recall"] > 0.5  # catches most of the obvious injected anomalies
    assert metrics["flagged_count"] > 0