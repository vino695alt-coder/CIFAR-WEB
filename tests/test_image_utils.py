import pytest
import numpy as np
from PIL import Image
from app.utils.image_utils import preprocess_for_inference

def test_preprocess_rgb_image_shape_and_dtype():
    # Create sample 100x100 RGB image
    img = Image.new("RGB", (100, 100), color=(255, 128, 0))
    processed = preprocess_for_inference(img)

    assert isinstance(processed, np.ndarray)
    assert processed.shape == (1, 32, 32, 3)
    assert processed.dtype == np.float32
    assert processed.min() >= 0.0
    assert processed.max() <= 1.0

def test_preprocess_grayscale_image():
    # Grayscale image (Mode L)
    img = Image.new("L", (64, 64), color=128)
    processed = preprocess_for_inference(img)

    assert processed.shape == (1, 32, 32, 3)
    assert processed.dtype == np.float32

def test_preprocess_rgba_image():
    # RGBA image with transparency
    img = Image.new("RGBA", (200, 150), color=(20, 40, 60, 255))
    processed = preprocess_for_inference(img)

    assert processed.shape == (1, 32, 32, 3)
    assert processed.dtype == np.float32

def test_preprocess_exact_cifar_dimensions():
    # 32x32 image
    img = Image.new("RGB", (32, 32), color=(0, 0, 0))
    processed = preprocess_for_inference(img)

    assert processed.shape == (1, 32, 32, 3)
    assert np.allclose(processed, 0.0)
