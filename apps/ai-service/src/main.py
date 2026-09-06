from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from src.inference import predict_anomaly, predict_yield, ModelNotTrainedError

app = FastAPI(title="Honey Chain AI Service")


class AnomalyRequest(BaseModel):
    temperature: float
    humidity: float
    weight: float
    weight_change: float
    acoustic_features: float = Field(default=0.5, description="0-1, defaults to neutral if unavailable")


class YieldRequest(BaseModel):
    temperature: float
    humidity: float
    weight: float
    weight_change: float
    season: str = Field(pattern="^(winter|spring|summer|autumn)$")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict/anomaly")
def anomaly_endpoint(input: AnomalyRequest):
    try:
        return predict_anomaly(input.model_dump())
    except ModelNotTrainedError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/predict/yield")
def yield_endpoint(input: YieldRequest):
    try:
        return predict_yield(input.model_dump(exclude={"season"}), input.season)
    except ModelNotTrainedError as e:
        raise HTTPException(status_code=503, detail=str(e))