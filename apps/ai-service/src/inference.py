"""
Loads both trained models once and exposes simple predict functions. Raises a clear,
actionable error if models haven't been trained yet — much friendlier than a raw
FileNotFoundError stack trace the first time someone forgets to run training.
"""
import joblib

from src.config import ANOMALY_MODEL_PATH, YIELD_MODEL_PATH, ANOMALY_FEATURES
from src.features import build_yield_feature_row


class ModelNotTrainedError(Exception):
    pass


def _load(path, train_command: str):
    if not path.exists():
        raise ModelNotTrainedError(
            f"Model file not found at {path}. Run `{train_command}` first."
        )
    return joblib.load(path)


_anomaly_model = None
_yield_model = None


def get_anomaly_model():
    global _anomaly_model
    if _anomaly_model is None:
        _anomaly_model = _load(ANOMALY_MODEL_PATH, "python -m src.train_anomaly")
    return _anomaly_model


def get_yield_model():
    global _yield_model
    if _yield_model is None:
        _yield_model = _load(YIELD_MODEL_PATH, "python -m src.train_yield")
    return _yield_model


def predict_anomaly(reading: dict) -> dict:
    model = get_anomaly_model()
    row = [[reading[f] for f in ANOMALY_FEATURES]]
    raw_prediction = model.predict(row)[0]  # -1 or 1
    score = model.decision_function(row)[0]  # higher = more normal, lower = more anomalous
    return {
        "status": "ANOMALY" if raw_prediction == -1 else "NORMAL",
        "anomaly_score": round(float(score), 4),
    }


def predict_yield(reading: dict, season: str) -> dict:
    model = get_yield_model()
    row = [build_yield_feature_row(reading, season)]
    prediction = model.predict(row)[0]
    return {"expected_yield_kg": round(float(prediction), 2)}