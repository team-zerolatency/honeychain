import pandas as pd
import pytest
from src.data_mapping.common import validate_base_schema, add_derived_features, BASE_SCHEMA


def test_validate_base_schema_raises_on_missing_column():
    df = pd.DataFrame({"timestamp": [1], "hive_id": ["a"]})
    with pytest.raises(ValueError):
        validate_base_schema(df, "test-source")


def test_validate_base_schema_passes_with_all_columns():
    df = pd.DataFrame({c: [0] for c in BASE_SCHEMA})
    df["timestamp"] = pd.to_datetime(["2026-01-01"])
    validate_base_schema(df, "test-source")  # should not raise


def test_add_derived_features_handles_different_sampling_intervals_per_hive():
    hourly = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=200, freq="h"),
        "hive_id": "HOURLY-HIVE",
        "weight": [40 + 0.01 * i for i in range(200)],
        "temperature": 34, "humidity": 55, "acoustic_features": 0.5, "label": pd.NA, "source": "test",
    })
    # Readings every 3 days — exactly the case a fixed row-count shift gets wrong.
    sparse = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=10, freq="3D"),
        "hive_id": "SPARSE-HIVE",
        "weight": [40 + i for i in range(10)],  # +1kg every 3 days
        "temperature": 34, "humidity": 55, "acoustic_features": 0.5, "label": pd.NA, "source": "test",
    })
    df = pd.concat([hourly, sparse], ignore_index=True)
    result = add_derived_features(df)

    sparse_result = result[result["hive_id"] == "SPARSE-HIVE"].sort_values("timestamp")
    first_yield = sparse_result.iloc[0]["yield_kg"]
    # 7 days ahead, at +1kg per 3 days, should land near +2 to +3kg — not NaN, and not
    # some nonsensical value from grabbing a literal 168th row that doesn't exist here.
    assert pd.notna(first_yield)
    assert 1.5 <= first_yield <= 3.5