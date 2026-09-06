from unittest.mock import patch
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


@patch("src.main.predict_anomaly")
def test_anomaly_endpoint_returns_prediction(mock_predict):
    mock_predict.return_value = {"status": "NORMAL", "anomaly_score": 0.12}
    res = client.post("/predict/anomaly", json={
        "temperature": 34, "humidity": 55, "weight": 40, "weight_change": 0.02, "acoustic_features": 0.5,
    })
    assert res.status_code == 200
    assert res.json()["status"] == "NORMAL"


def test_anomaly_endpoint_rejects_missing_fields():
    res = client.post("/predict/anomaly", json={"temperature": 34})
    assert res.status_code == 422


@patch("src.main.predict_anomaly")
def test_anomaly_endpoint_returns_503_when_model_not_trained(mock_predict):
    from src.inference import ModelNotTrainedError
    mock_predict.side_effect = ModelNotTrainedError("Model file not found. Run training first.")
    res = client.post("/predict/anomaly", json={
        "temperature": 34, "humidity": 55, "weight": 40, "weight_change": 0.02, "acoustic_features": 0.5,
    })
    assert res.status_code == 503


@patch("src.main.predict_yield")
def test_yield_endpoint_returns_prediction(mock_predict):
    mock_predict.return_value = {"expected_yield_kg": 3.2}
    res = client.post("/predict/yield", json={
        "temperature": 34, "humidity": 55, "weight": 40, "weight_change": 0.02, "season": "summer",
    })
    assert res.status_code == 200
    assert res.json()["expected_yield_kg"] == 3.2


def test_yield_endpoint_rejects_invalid_season():
    res = client.post("/predict/yield", json={
        "temperature": 34, "humidity": 55, "weight": 40, "weight_change": 0.02, "season": "monsoon",
    })
    assert res.status_code == 422