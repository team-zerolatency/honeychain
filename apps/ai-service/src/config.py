from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # apps/ai-service/
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
MAPPED_DIR = DATA_DIR / "mapped"
PROCESSED_DIR = DATA_DIR / "processed"
MODELS_DIR = BASE_DIR / "models"

TRAINING_DATA_PATH = PROCESSED_DIR / "training_data.csv"
ANOMALY_MODEL_PATH = MODELS_DIR / "anomaly_model.joblib"
ANOMALY_METADATA_PATH = MODELS_DIR / "anomaly_model_metadata.json"
YIELD_MODEL_PATH = MODELS_DIR / "yield_model.joblib"
YIELD_METADATA_PATH = MODELS_DIR / "yield_model_metadata.json"

ANOMALY_FEATURES = ["temperature", "humidity", "weight", "weight_change", "acoustic_features"]
YIELD_FEATURES = [
    "temperature", "humidity", "weight", "weight_change",
    "season_winter", "season_spring", "season_summer", "season_autumn",
]