# MASTER PROMPT — CIFAR-10 AI IMAGE CLASSIFICATION WEB APP

## ROLE

Act as a **Senior Machine Learning Engineer + Python Developer + Flask Architect + MLOps Engineer + Frontend Engineer + Premium UI/UX Designer + QA Engineer + Production Deployment Engineer**.

Your job is to take my **existing trained CIFAR-10 ANN model** and build a complete, polished, production-ready web application around it.

The final project must be suitable for:

* Machine Learning portfolio
* Deep Learning portfolio
* Flask deployment demonstration
* GitHub project
* Resume project
* Live demo
* Future cloud deployment

---

# IMPORTANT: EXISTING MODEL

I have already trained the CIFAR-10 model and supplied the trained model file.

### DO NOT TRAIN A NEW MODEL.

### DO NOT MODIFY MY MODEL.

### DO NOT REPLACE THE ANN WITH A CNN.

### DO NOT CHANGE THE MODEL ARCHITECTURE.

### DO NOT change the CIFAR-10 class ordering.

### DO NOT change the preprocessing unless inspection of the supplied model/project proves that the existing preprocessing is different.

The web application is an **inference and deployment layer** for my existing model.

---

# PHASE 1 — INSPECT BEFORE BUILDING

Before creating application code, inspect the supplied project/model.

Determine:

1. Model file type
2. Model input shape
3. Model output shape
4. Number of output classes
5. Model architecture
6. Required TensorFlow/Keras version compatibility
7. Existing preprocessing
8. Whether the model loads successfully

If source code, notebooks, configuration files, or other project files are available, inspect them when necessary to determine the actual training preprocessing.

Do not blindly assume the architecture or preprocessing.

If the model cannot be loaded, diagnose the problem before continuing.

---

# PHASE 2 — CIFAR-10 CLASS MAPPING

Unless the supplied training project explicitly defines a different mapping, use the standard CIFAR-10 ordering:

```python
CLASS_NAMES = [
    "airplane",
    "automobile",
    "bird",
    "cat",
    "deer",
    "dog",
    "frog",
    "horse",
    "ship",
    "truck"
]
```

Mapping:

```text
0 → airplane
1 → automobile
2 → bird
3 → cat
4 → deer
5 → dog
6 → frog
7 → horse
8 → ship
9 → truck
```

Never reorder these classes.

---

# PHASE 3 — IMAGE PREPROCESSING

The web application must reproduce the model's training preprocessing exactly.

If the trained model/project confirms that the model was trained with:

```python
X = X.astype("float32") / 255.0
```

then use:

```text
Uploaded Image
      ↓
Validate
      ↓
Pillow
      ↓
RGB
      ↓
Resize to 32 × 32
      ↓
NumPy
      ↓
float32
      ↓
/ 255.0
      ↓
Add batch dimension
      ↓
ANN Model
```

Expected input:

```text
(1, 32, 32, 3)
```

Do not:

* convert to grayscale
* use ImageNet preprocessing
* use mean/std normalization
* divide by 255 twice
* reverse RGB channels
* resize to 224×224
* introduce CNN preprocessing

---

# CRITICAL IMAGE PREVIEW RULE

The image displayed in the browser must remain the **original uploaded image**.

Do not display the normalized NumPy array.

Only the internal inference copy should be converted to:

```text
RGB
32 × 32
float32
normalized
```

The browser preview should remain visually normal.

---

# PHASE 4 — APPLICATION NAME

Use the application name:

# CIFAR Vision

Tagline:

**AI-Powered CIFAR-10 Image Classification**

Create a polished AI-product experience rather than a basic Flask demo.

---

# PHASE 5 — PRODUCTION ARCHITECTURE

Use a clean modular architecture.

Create:

```text
cifar-vision/
│
├── app/
│   ├── __init__.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   └── prediction.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   └── predictor.py
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── image_utils.py
│   │   └── validators.py
│   │
│   ├── templates/
│   │   ├── base.html
│   │   └── index.html
│   │
│   └── static/
│       ├── css/
│       │   └── style.css
│       ├── js/
│       │   └── app.js
│       └── images/
│
├── models/
│   └── cifar10_model.keras
│
├── tests/
│   ├── __init__.py
│   ├── test_predictor.py
│   ├── test_image_utils.py
│   └── test_routes.py
│
├── uploads/
│   └── .gitkeep
│
├── config.py
├── run.py
├── requirements.txt
├── .env
├── .env.example
├── .gitignore
├── Procfile
└── README.md
```

Use the actual supplied model filename where appropriate.

Do not create a monolithic `app.py`.

---

# PHASE 6 — FLASK APPLICATION

Use the Flask Application Factory pattern:

```python
create_app()
```

Use Blueprints.

Implement:

```text
GET  /
POST /predict
GET  /health
```

---

# PHASE 7 — MODEL SERVICE

Create:

```text
app/services/predictor.py
```

Implement a clean prediction service.

Example design:

```python
class CIFAR10Predictor:

    def __init__(self, model_path):
        ...

    def preprocess_image(self, image):
        ...

    def predict(self, image):
        ...

    def get_top_predictions(self, probabilities, top_k=3):
        ...
```

Responsibilities:

* Load model
* Preprocess images
* Run inference
* Calculate predicted class
* Calculate confidence
* Calculate Top-3
* Return all class probabilities

## MODEL LOADING

Load the model **once** during application startup.

Never do this:

```python
def predict():
    model = load_model(...)
```

Instead initialize the predictor once and reuse it.

---

# PHASE 8 — PREDICTION API

Create:

```text
POST /predict
```

Accept:

```text
multipart/form-data
```

with:

```text
file
```

Return structured JSON.

Example:

```json
{
    "success": true,
    "prediction": {
        "class_name": "dog",
        "class_index": 5,
        "confidence": 72.45
    },
    "top_predictions": [
        {
            "class_name": "dog",
            "class_index": 5,
            "confidence": 72.45
        },
        {
            "class_name": "cat",
            "class_index": 3,
            "confidence": 12.21
        },
        {
            "class_name": "horse",
            "class_index": 7,
            "confidence": 6.18
        }
    ],
    "probabilities": {
        "airplane": 1.2,
        "automobile": 0.8,
        "bird": 2.51,
        "cat": 12.21,
        "deer": 1.05,
        "dog": 72.45,
        "frog": 4.02,
        "horse": 6.18,
        "ship": 0.9,
        "truck": 0.68
    }
}
```

These numbers are examples only.

Use actual model output.

---

# PHASE 9 — HEALTH CHECK

Implement:

```text
GET /health
```

Return:

```json
{
    "status": "healthy",
    "model_loaded": true
}
```

Do not expose sensitive information.

---

# PHASE 10 — PREMIUM UI/UX

Design the application as a **premium AI SaaS dashboard**.

The UI must NOT look like:

* a basic Flask tutorial
* a college assignment
* a plain HTML form
* an ordinary Bootstrap template

Use a premium visual language:

### Background

Deep navy / charcoal.

### Primary

Indigo / violet.

### Secondary

Cyan / blue.

### Success

Emerald.

### Components

* Glassmorphism
* Soft shadows
* Subtle gradients
* Rounded corners
* Elegant typography
* Thin borders
* Spacious layouts
* Modern icons
* Smooth micro-interactions
* Subtle animations

Keep the design sophisticated.

Do not overuse neon effects.

Use CSS variables for the design system.

---

# PHASE 11 — HEADER

Create:

```text
CIFAR Vision
AI Image Classification
```

Right side:

```text
● Model Online
```

The status indicator should look like a professional system health indicator.

---

# PHASE 12 — HERO

Display:

```text
CIFAR-10
Image Classification
```

Subtitle:

```text
Upload an image and let our trained Artificial Neural Network
identify what it sees.
```

Technology badges:

```text
TensorFlow
Flask
ANN
CIFAR-10
```

---

# PHASE 13 — IMAGE UPLOAD

Create a large premium drag-and-drop area.

Display:

```text
Drop your image here

or

Browse Image
```

Supported:

```text
JPG
JPEG
PNG
WEBP
```

Maximum:

```text
5 MB
```

Implement:

* Click upload
* Drag/drop
* Drag-over animation
* File validation
* Preview
* Change image
* Clear

---

# PHASE 14 — IMAGE PREVIEW

After selection:

Show:

```text
Uploaded Image
```

Display:

* Original image
* Filename
* File size
* Change Image button

Make the preview visually attractive.

Do not normalize the browser preview.

---

# PHASE 15 — PREDICT BUTTON

Create a large premium CTA:

```text
✦ Predict Image
```

Before upload:

```text
Disabled
```

After upload:

```text
Enabled
```

During prediction:

```text
Analyzing...
```

with a spinner.

Disable duplicate submissions during inference.

---

# PHASE 16 — PREDICTION RESULT

After inference, reveal a premium result card.

Example layout:

```text
Prediction Result

🐶

DOG

72.45%

Confidence
```

The class name should be the visual focal point.

Add a subtle animation when results appear.

Use actual model output.

---

# PHASE 17 — CLASS ICONS

Use:

```python
CLASS_ICONS = {
    "airplane": "✈️",
    "automobile": "🚗",
    "bird": "🐦",
    "cat": "🐱",
    "deer": "🦌",
    "dog": "🐶",
    "frog": "🐸",
    "horse": "🐴",
    "ship": "🚢",
    "truck": "🚚"
}
```

Icons should support the text, not replace it.

---

# PHASE 18 — TOP 3

Display:

```text
Top Predictions
```

Example:

```text
01  Dog       72.45%
02  Cat       12.21%
03  Horse      6.18%
```

Sort by probability descending.

Use actual predictions.

---

# PHASE 19 — ALL PROBABILITIES

Create:

```text
Class Probabilities
```

Display all 10 classes.

Each row should contain:

* Class name
* Icon
* Percentage
* Progress bar

Example:

```text
Dog       ████████████████████ 72.45%
Cat       ██████               12.21%
Horse     ███                   6.18%
Frog      ██                    4.02%
Bird      █                     2.51%
...
```

Sort descending.

Animate progress bars from 0 to their actual values.

---

# PHASE 20 — CLEAR FUNCTION

Create a prominent secondary button:

```text
Clear
```

When clicked:

* Clear uploaded image
* Clear preview
* Reset file input
* Clear prediction
* Clear confidence
* Clear Top-3
* Clear probability bars
* Clear errors
* Reset button state
* Return to initial UI

Do NOT reload the page.

The user should immediately be able to upload another image.

---

# PHASE 21 — FRONTEND TECHNOLOGY

Use:

* HTML5
* CSS3
* Vanilla JavaScript

Do not introduce React.

Do not introduce unnecessary frontend frameworks.

Use the Fetch API to communicate with Flask.

Example:

```javascript
const formData = new FormData();
formData.append("file", file);

const response = await fetch("/predict", {
    method: "POST",
    body: formData
});
```

No full-page reload for prediction.

---

# PHASE 22 — VALIDATION

Maximum upload:

```text
5 MB
```

Allowed:

```text
image/jpeg
image/png
image/webp
```

Validate both:

* filename/extension
* actual image content

Reject corrupt files.

---

# PHASE 23 — ERROR UX

Create polished user-facing errors.

### No file

```text
Please select an image before predicting.
```

### Invalid file

```text
Unsupported file type.
Please upload JPG, JPEG, PNG, or WEBP.
```

### Too large

```text
Image is too large.
Maximum file size is 5 MB.
```

### Corrupt

```text
We couldn't read this image.
Please upload a valid image file.
```

### Prediction failure

```text
Prediction service is temporarily unavailable.
Please try again.
```

Never show Python stack traces to users.

Log technical details server-side.

---

# PHASE 24 — SECURITY

Implement production-safe practices:

* Maximum upload size
* File extension validation
* MIME validation
* Actual image validation
* Secure filenames
* Path traversal protection
* No executable uploads
* No `.env` exposure
* No model file exposure
* Production secret key
* Debug disabled in production
* Safe error responses
* Appropriate security headers where practical

Prefer processing uploads in memory instead of permanently storing them when possible.

---

# PHASE 25 — CONFIGURATION

Create:

```text
config.py
```

Use environment variables.

`.env.example`:

```env
SECRET_KEY=change-this-in-production
MODEL_PATH=models/cifar10_model.keras
MAX_CONTENT_LENGTH=5242880
```

Never commit actual secrets.

---

# PHASE 26 — DEPENDENCIES

Create a clean:

```text
requirements.txt
```

Use only required dependencies.

Expected packages include:

```text
Flask
tensorflow
numpy
Pillow
python-dotenv
gunicorn
```

Choose versions compatible with the supplied trained model/environment.

Do not install unnecessary libraries.

---

# PHASE 27 — TESTING

Create automated tests.

Test:

## Image preprocessing

Verify:

```text
RGB
32×32
float32
normalized range
batch shape
```

Expected shape:

```text
(1, 32, 32, 3)
```

## Prediction

Verify:

* Valid class index
* Valid class name
* Confidence between 0 and 100
* Exactly 10 probabilities
* Top-3 sorted correctly

## Routes

Test:

```text
GET /
GET /health
POST /predict
```

Test failure cases:

* No file
* Invalid file
* Oversized file
* Corrupt image

---

# PHASE 28 — LOGGING

Implement server-side logging.

Log:

* Application startup
* Model loading
* Prediction request
* Validation failure
* Inference failure

Never log:

* Secrets
* `.env`
* Raw image contents
* Sensitive user information

---

# PHASE 29 — RESPONSIVE DESIGN

Desktop:

```text
┌────────────────────────┬────────────────────────┐
│                        │                        │
│   Upload / Preview     │   Prediction Result    │
│                        │                        │
└────────────────────────┴────────────────────────┘
```

Mobile:

```text
Header
Hero
Upload
Preview
Predict
Prediction
Top 3
Probabilities
Clear
Footer
```

Support:

* Desktop
* Tablet
* Mobile

Ensure:

* No horizontal scrolling
* Touch-friendly controls
* Responsive cards
* Proper image sizing
* Readable typography

---

# PHASE 30 — ACCESSIBILITY

Implement:

* Semantic HTML
* Labels
* Alt text
* Keyboard navigation
* Visible focus states
* ARIA attributes where appropriate
* Accessible errors
* Good contrast
* Reduced-motion support

---

# PHASE 31 — README

Create a professional README.

Include:

## Project Overview

Explain what CIFAR Vision does.

## Features

* Image upload
* Drag and drop
* ANN inference
* Confidence
* Top-3 predictions
* Probability visualization
* Clear/reset
* Responsive UI
* Flask API

## Model

Document the actual inspected model architecture.

## Dataset

Explain CIFAR-10.

## Preprocessing

Document the actual preprocessing used.

## Project Structure

Show the folder structure.

## Installation

Windows:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Linux/macOS:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Running

```bash
python run.py
```

## API

Document:

```text
GET /
GET /health
POST /predict
```

## Production Deployment

Explain Gunicorn and deployment considerations.

## Troubleshooting

Include common model, TensorFlow, upload, and dependency errors.

---

# PHASE 32 — PRODUCTION DEPLOYMENT

Create:

```text
Procfile
```

Example:

```text
web: gunicorn run:app
```

Use Gunicorn for production deployment where supported.

Do not use the Flask development server as the production server.

Keep:

```text
MODEL_PATH
SECRET_KEY
MAX_CONTENT_LENGTH
```

configurable.

---

# PHASE 33 — CODE QUALITY

Follow professional standards:

* PEP 8
* Modular design
* Separation of concerns
* Type hints where useful
* Docstrings
* Meaningful names
* Reusable functions
* No duplicated logic
* No absolute machine-specific paths
* Environment-based configuration

Keep these responsibilities separate:

```text
Routes
Services
Utilities
Configuration
Frontend
Tests
```

---

# PHASE 34 — APPLICATION FLOW

The complete application should follow:

```text
User
  ↓
Upload Image
  ↓
Frontend Validation
  ↓
Image Preview
  ↓
Predict Button
  ↓
POST /predict
  ↓
Flask Validation
  ↓
Pillow
  ↓
RGB
  ↓
32×32
  ↓
float32
  ↓
Training-Compatible Preprocessing
  ↓
ANN Model
  ↓
Softmax
  ↓
Predicted Class
  ↓
Confidence
  ↓
Top-3
  ↓
All 10 Probabilities
  ↓
JSON Response
  ↓
Premium Result UI
  ↓
Clear
  ↓
Upload Another Image
```

---

# PHASE 35 — IMPORTANT: VERIFY EVERYTHING

Do not simply create files and claim completion.

Actually run the application.

Verify:

```text
GET /
```

```text
GET /health
```

```text
POST /predict
```

Actually upload an image.

Verify:

1. Image preview works.
2. Predict button works.
3. Flask receives the image.
4. Image preprocessing works.
5. Model loads correctly.
6. Prediction is returned.
7. Confidence is displayed.
8. Top-3 appears.
9. All probabilities appear.
10. Clear works.
11. A second image can be uploaded.
12. Invalid images are handled correctly.
13. Large files are rejected.
14. UI is responsive.
15. No browser console errors remain.

If an error occurs:

1. Inspect the error.
2. Identify the root cause.
3. Fix the code.
4. Restart the application.
5. Test again.
6. Continue until the core workflow works.

Do not stop at the first error.

---

# PHASE 36 — FINAL DESIGN STANDARD

The final application should feel like a real AI product.

Target visual quality:

**Premium**
**Minimal**
**Modern**
**Elegant**
**Professional**
**Responsive**
**Fast**
**Portfolio-ready**

Use subtle animations rather than excessive effects.

Use consistent spacing, typography, shadows, borders, and component states.

Make the prediction result the visual focus.

---

# PHASE 37 — FINAL DELIVERABLE

At the end, provide:

1. Complete project structure
2. All source files
3. Working Flask backend
4. Existing model integration
5. Premium frontend
6. Upload functionality
7. Drag-and-drop
8. Image preview
9. Prediction
10. Confidence
11. Top-3 predictions
12. All 10 probabilities
13. Clear/reset
14. Validation
15. Error handling
16. Security
17. Tests
18. Logging
19. `.env.example`
20. `requirements.txt`
21. `Procfile`
22. Professional README
23. Local run instructions
24. Production deployment instructions

---

# FINAL INSTRUCTION

Work as an autonomous senior engineer.

**Inspect → Plan → Build → Run → Test → Debug → Polish → Verify.**

Do not skip verification.

Do not retrain my model.

Do not replace the ANN with CNN.

Do not alter the trained model.

Do not change preprocessing without first inspecting the supplied training/model files.

Do not stop after generating files.

The final result must be a **fully functional, production-grade Flask CIFAR-10 ANN image classification web application with a premium UI/UX**.
