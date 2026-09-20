import os
import pytest
from PIL import Image
from app.services.predictor import CIFAR10Predictor, CLASS_NAMES, CLASS_ICONS

@pytest.fixture
def predictor():
    model_path = os.path.join("models", "cifar10_model.keras")
    return CIFAR10Predictor(model_path)

def test_class_names_and_icons_consistency():
    assert len(CLASS_NAMES) == 10
    assert CLASS_NAMES == [
        "airplane", "automobile", "bird", "cat", "deer",
        "dog", "frog", "horse", "ship", "truck"
    ]
    assert len(CLASS_ICONS) == 10
    for name in CLASS_NAMES:
        assert name in CLASS_ICONS

def test_prediction_output_structure(predictor):
    if not predictor.is_loaded:
        pytest.skip("Model not yet trained or available.")

    sample_img = Image.new("RGB", (32, 32), color=(100, 150, 200))
    result = predictor.predict(sample_img)

    assert result["success"] is True
    assert "prediction" in result
    assert "top_predictions" in result
    assert "probabilities" in result
    assert "all_classes_sorted" in result

    # Validate top prediction
    top_pred = result["prediction"]
    assert top_pred["class_name"] in CLASS_NAMES
    assert 0 <= top_pred["class_index"] <= 9
    assert 0.0 <= top_pred["confidence"] <= 100.0

    # Validate Top-3
    top_3 = result["top_predictions"]
    assert len(top_3) == 3
    assert top_3[0]["confidence"] >= top_3[1]["confidence"] >= top_3[2]["confidence"]

    # Validate Probabilities dictionary
    probs = result["probabilities"]
    assert len(probs) == 10
    total_prob = sum(probs.values())
    assert 98.0 <= total_prob <= 102.0  # Allow slight rounding variance
