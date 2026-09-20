import io
import pytest
from PIL import Image
from app import create_app

@pytest.fixture
def client():
    app = create_app(config_name="testing")
    with app.test_client() as client:
        yield client

def test_get_index(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"CIFAR Vision" in response.data
    assert b"CIFAR-10 Image Classification" in response.data

def test_get_health(client):
    response = client.get("/health")
    assert response.status_code in [200, 503]
    json_data = response.get_json()
    assert "status" in json_data
    assert "model_loaded" in json_data

def test_predict_no_file(client):
    response = client.post("/predict")
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data["success"] is False
    assert "Please select an image before predicting" in json_data["error"]

def test_predict_invalid_extension(client):
    data = {
        "file": (io.BytesIO(b"fake txt content"), "test.txt")
    }
    response = client.post("/predict", data=data, content_type="multipart/form-data")
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data["success"] is False
    assert "Unsupported file type" in json_data["error"]

def test_predict_corrupt_image(client):
    data = {
        "file": (io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00corruptbytes"), "corrupt.png")
    }
    response = client.post("/predict", data=data, content_type="multipart/form-data")
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data["success"] is False
    assert "We couldn't read this image" in json_data["error"]

def test_predict_valid_image(client):
    # Generate test in-memory PNG
    img_byte_arr = io.BytesIO()
    img = Image.new("RGB", (64, 64), color=(255, 0, 0))
    img.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)

    data = {
        "file": (img_byte_arr, "sample_test.png")
    }
    response = client.post("/predict", data=data, content_type="multipart/form-data")
    if response.status_code == 503:
        pytest.skip("Model not loaded in test environment.")

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert "prediction" in json_data
    assert "top_predictions" in json_data
    assert "probabilities" in json_data
