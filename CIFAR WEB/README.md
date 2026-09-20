# CIFAR Vision — AI-Powered CIFAR-10 Image Classification

![CIFAR Vision Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?style=for-the-badge&logo=tensorflow)
![Flask](https://img.shields.io/badge/Flask-3.x-black?style=for-the-badge&logo=flask)
![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python)

**CIFAR Vision** is a production-grade, modular Flask web application and REST API designed to serve real-time predictions from a trained Artificial Neural Network (ANN) on the CIFAR-10 dataset.

---

## 🌟 Key Features

* **Real-Time ANN Inference**: Evaluates images through a dense multi-layer Artificial Neural Network.
* **Live Camera / Webcam Capture**: Take real-time photos directly using your device camera with targeting crosshairs and flip camera support.
* **Instant Drag-and-Drop**: Interactive dropzone with client-side and server-side file integrity validation.
* **Original Aspect-Ratio Preview**: Renders the un-normalized original image before inference.
* **Top-3 Podium & All 10 Class Rankings**: Dynamically displays confidence percentages with animated progress bars.
* **10-Class Sample Gallery**: One-click test samples for each CIFAR-10 category.
* **Zero-Reload Clear Function**: Instantaneous interface reset without full-page refreshes.
* **REST API & Health Monitoring**: Dedicated `/predict` and `/health` endpoints for external integration.
* **Enterprise Security**: Header hardening (`X-Frame-Options`, `X-Content-Type-Options`), strict MIME validation, file size limits (5 MB), and safe error handling.

---

## 🧠 Model & Preprocessing Architecture

### Model Topology
The neural network follows the exact sequential dense ANN architecture trained on CIFAR-10:

```text
Input (32, 32, 3)
      ↓
Flatten (3,072 units)
      ↓
Dense (512 units, ReLU activation)
      ↓
Dropout (rate = 0.3)
      ↓
Dense (256 units, ReLU activation)
      ↓
Dropout (rate = 0.3)
      ↓
Dense (128 units, ReLU activation)
      ↓
Dense (10 units, Softmax activation)
```

### Preprocessing Pipeline
1. **Format Handling**: Loaded via Pillow and converted to `RGB`.
2. **Dimension Resizing**: Resized to $32 \times 32$ using bilinear interpolation.
3. **Data Type & Normalization**: Cast to `float32` and scaled by dividing by `255.0` (mapping to range $[0.0, 1.0]$).
4. **Batch Dimension**: Reshaped into batch format `(1, 32, 32, 3)`.

### CIFAR-10 Class Mapping
| Index | Class Name | Icon |
|:-----:|:-----------|:----:|
| 0 | airplane | ✈️ |
| 1 | automobile | 🚗 |
| 2 | bird | 🐦 |
| 3 | cat | 🐱 |
| 4 | deer | 🦌 |
| 5 | dog | 🐶 |
| 6 | frog | 🐸 |
| 7 | horse | 🐴 |
| 8 | ship | 🚢 |
| 9 | truck | 🚚 |

---

## 📁 Project Structure

```text
cifar-vision/
├── app/
│   ├── __init__.py            # Application Factory (create_app)
│   ├── routes/
│   │   ├── __init__.py
│   │   └── prediction.py      # Blueprints (/ , /health, /predict)
│   ├── services/
│   │   ├── __init__.py
│   │   └── predictor.py       # CIFAR10Predictor service & inference engine
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── image_utils.py     # Resizing & normalization pipeline
│   │   └── validators.py      # Extension, MIME, and integrity validators
│   ├── templates/
│   │   ├── base.html          # Base layout, typography, status badge
│   │   └── index.html         # Main dashboard layout
│   └── static/
│       ├── css/
│       │   └── style.css      # Dark theme, glassmorphism design system
│       ├── js/
│       │   └── app.js         # Client-side validation, previews, fetch API
│       └── images/
│           └── samples/       # 10 preset sample images
├── models/
│   └── cifar10_model.keras    # Trained Keras model weights
├── tests/
│   ├── __init__.py
│   ├── test_predictor.py      # Predictor service unit tests
│   ├── test_image_utils.py    # Image normalization unit tests
│   └── test_routes.py         # HTTP endpoints & error handling tests
├── uploads/
│   └── .gitkeep
├── config.py                  # Multi-environment configurations
├── run.py                     # Application entry point
├── train_and_save_model.py    # Model training script
├── requirements.txt           # Project dependencies
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore rules
├── Procfile                   # Cloud deployment declaration
└── README.md                  # Documentation
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- Python 3.10+ or Python 3.11
- Virtual environment tool (`venv` or Conda)

### 2. Setup Environment
```bash
# Clone the repository
git clone <repository_url>
cd "CIFAR WEB"

# Create and activate virtual environment
# On Windows (PowerShell):
python -m venv venv
venv\Scripts\Activate.ps1

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Train/Export Model (if needed)
```bash
python train_and_save_model.py
```

### 5. Run the Application
```bash
python run.py
```
Open your browser at [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## 🧪 Running Automated Tests

Run the full automated test suite with `pytest`:

```bash
pytest -v tests/
```

---

## 📡 API Reference

### 1. Health Check
* **Endpoint**: `GET /health`
* **Response (200 OK)**:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### 2. Predict Image
* **Endpoint**: `POST /predict`
* **Content-Type**: `multipart/form-data`
* **Body Parameter**: `file` (image binary)
* **Response (200 OK)**:
```json
{
  "success": true,
  "prediction": {
    "class_name": "dog",
    "class_index": 5,
    "icon": "🐶",
    "confidence": 72.45
  },
  "top_predictions": [
    {"class_name": "dog", "class_index": 5, "icon": "🐶", "confidence": 72.45},
    {"class_name": "cat", "class_index": 3, "icon": "🐱", "confidence": 12.21},
    {"class_name": "horse", "class_index": 7, "icon": "🐴", "confidence": 6.18}
  ],
  "probabilities": {
    "airplane": 1.20,
    "automobile": 0.80,
    "bird": 2.51,
    "cat": 12.21,
    "deer": 1.05,
    "dog": 72.45,
    "frog": 4.02,
    "horse": 6.18,
    "ship": 0.90,
    "truck": 0.68
  }
}
```

---

## 🌐 Production Deployment

### Gunicorn Deployment
In production environments (e.g. Linux / Docker / Heroku / AWS / GCP), use Gunicorn:

```bash
gunicorn -w 4 -b 0.0.0.0:5000 "run:app"
```

---

## 📄 License
MIT License. Created for Deep Learning & Flask deployment portfolio demonstrations.
