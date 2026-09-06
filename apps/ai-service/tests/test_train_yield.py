import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error


def test_yield_model_beats_naive_mean_baseline():
    rng = np.random.default_rng(1)
    n = 300
    weight_change = rng.normal(0.05, 0.02, n)
    # yield correlates strongly with weight_change, by construction, so a real model
    # should clearly outperform "always predict the average."
    y = weight_change * 100 + rng.normal(0, 0.5, n)
    X = pd.DataFrame({
        "temperature": rng.normal(34, 1, n), "humidity": rng.normal(55, 3, n),
        "weight": rng.normal(40, 1, n), "weight_change": weight_change,
        "season_winter": 0, "season_spring": 0, "season_summer": 1, "season_autumn": 0,
    })

    split = int(n * 0.8)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X[:split], y[:split])
    predictions = model.predict(X[split:])

    naive_mae = mean_absolute_error(y[split:], [y[:split].mean()] * (n - split))
    model_mae = mean_absolute_error(y[split:], predictions)
    assert model_mae < naive_mae