import os
import logging
from flask import Flask, jsonify
from config import config_by_name
from app.services.predictor import predictor_service

def setup_logging(app: Flask):
    """Configures structured server-side logging."""
    log_level = logging.DEBUG if app.debug else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

def create_app(config_name: str = "default") -> Flask:
    """
    Application Factory for CIFAR Vision.
    """
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static"
    )

    # 1. Load Configuration
    config_obj = config_by_name.get(config_name, config_by_name["default"])
    app.config.from_object(config_obj)

    # 2. Setup Logging
    setup_logging(app)
    app.logger.info(f"Initializing CIFAR Vision App with config profile: {config_name}")

    # 3. Initialize Model Predictor Service
    model_path = app.config.get("MODEL_PATH")
    if model_path and os.path.exists(model_path):
        predictor_service.load_model(model_path)
    else:
        app.logger.warning(
            f"Model path does not exist at startup: {model_path}. "
            "Predictor service will be loaded once model file is available."
        )

    # 4. Register Blueprints
    from app.routes.prediction import prediction_bp
    app.register_blueprint(prediction_bp)

    # 5. Security Headers Hook
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    # 6. Global Error Handlers
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({
            "success": False,
            "error": "Image is too large. Maximum file size is 5 MB."
        }), 413

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "success": False,
            "error": "Resource not found."
        }), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f"Unhandled 500 error: {str(error)}")
        return jsonify({
            "success": False,
            "error": "Internal server error occurred."
        }), 500

    return app
