import pandas as pd
from src.features import add_season_one_hot, build_yield_feature_row


def test_add_season_one_hot_marks_correct_column():
    df = pd.DataFrame({"season": ["winter", "summer"]})
    result = add_season_one_hot(df)
    assert result.loc[0, "season_winter"] == 1
    assert result.loc[0, "season_summer"] == 0
    assert result.loc[1, "season_summer"] == 1


def test_build_yield_feature_row_order_matches_config():
    reading = {"temperature": 34.0, "humidity": 55.0, "weight": 40.0, "weight_change": 0.1}
    row = build_yield_feature_row(reading, "summer")
    assert len(row) == 8  # 4 base features + 4 one-hot season columns
    assert row[0] == 34.0
    assert row[6] == 1.0  # season_summer position, per YIELD_FEATURES order