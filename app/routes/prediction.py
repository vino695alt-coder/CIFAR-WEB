import logging
from flask import Blueprint, render_template, request, jsonify, current_app
from app.utils.validators import validate_image_file, ValidationError
from app.services.predictor import predictor_service, CLASS_NAMES, CLASS_ICONS

logger = logging.getLogger(__name__)

prediction_bp = Blueprint("prediction", __name__)

@prediction_bp.route("/", methods=["GET"])
def index():
    """Renders the main CIFAR Vision application dashboard."""
    return render_template(
        "index.html",
        classes=CLASS_NAMES,
        icons=CLASS_ICONS,
        model_loaded=predictor_service.is_loaded
    )

@prediction_bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint indicating model readiness and service health."""
    is_healthy = predictor_service.is_loaded
    return jsonify({
        "status": "healthy" if is_healthy else "degraded",
        "model_loaded": predictor_service.is_loaded
    }), (200 if is_healthy else 503)

@prediction_bp.route("/predict", methods=["POST"])
def predict():
    """
    Accepts multipart/form-data image upload, validates, and runs model inference.
    """
    # 1. Check if model is online
    if not predictor_service.is_loaded:
        logger.error("Predict endpoint invoked but model is not loaded.")
        return jsonify({
            "success": False,
            "error": "Prediction service is temporarily unavailable. Please try again."
        }), 503

    # 2. Extract uploaded file
    if "file" not in request.files:
        logger.warning("Predict request received without 'file' field.")
        return jsonify({
            "success": False,
            "error": "Please select an image before predicting."
        }), 400

    file = request.files["file"]

    # 3. Validate image
    try:
        pil_image = validate_image_file(file)
    except ValidationError as ve:
        logger.warning(f"Image validation failed: {ve.message}")
        return jsonify({
            "success": False,
            "error": ve.message
        }), ve.status_code
    except Exception as e:
        logger.error(f"Unexpected error during image validation: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "We couldn't read this image. Please upload a valid image file."
        }), 400

    # 4. Perform Inference
    try:
        result = predictor_service.predict(pil_image)
        logger.info(
            f"Inference completed: predicted={result['prediction']['class_name']} "
            f"({result['prediction']['confidence']}%)"
        )
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Inference failure: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Prediction service is temporarily unavailable. Please try again."
        }), 500
