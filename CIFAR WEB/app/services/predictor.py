import os
import logging
from typing import Dict, List, Any, Optional
import numpy as np
import tensorflow as tf
from PIL import Image
from app.utils.image_utils import preprocess_for_inference

logger = logging.getLogger(__name__)

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

class CIFAR10Predictor:
    """
    Singleton service managing the trained CIFAR-10 Artificial Neural Network (ANN) model.
    Loads the model once upon initialization and handles inference pipelines.
    """
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model: Optional[tf.keras.Model] = None
        self.is_loaded: bool = False
        if model_path:
            self.load_model(model_path)

    def load_model(self, model_path: str) -> None:
        """Loads the trained Keras model from disk."""
        if not os.path.exists(model_path):
            logger.warning(f"Model file not found at path: {model_path}")
            self.is_loaded = False
            return

        try:
            logger.info(f"Loading CIFAR-10 model from: {model_path}")
            self.model = tf.keras.models.load_model(model_path)
            self.model_path = model_path
            self.is_loaded = True
            logger.info("CIFAR-10 ANN Model successfully loaded and ready for inference.")
            
            # Warm up model with dummy input
            dummy_input = np.zeros((1, 32, 32, 3), dtype=np.float32)
            self.model.predict(dummy_input, verbose=0)
            logger.info("Model warm-up completed successfully.")
        except Exception as e:
            logger.error(f"Failed to load CIFAR-10 model: {str(e)}", exc_info=True)
            self.is_loaded = False
            self.model = None

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        """
        Executes end-to-end inference on a PIL image.
        
        Returns a structured dictionary:
        {
            "success": True,
            "prediction": {
                "class_name": "dog",
                "class_index": 5,
                "icon": "🐶",
                "confidence": 72.45
            },
            "top_predictions": [
                {"class_name": "dog", "class_index": 5, "icon": "🐶", "confidence": 72.45},
                ...
            ],
            "probabilities": {
                "airplane": 1.2,
                ...
            },
            "all_classes_sorted": [
                {"class_name": "dog", "class_index": 5, "icon": "🐶", "confidence": 72.45},
                ...
            ]
        }
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model is not loaded or unavailable.")

        # 1. Preprocess image
        input_array = preprocess_for_inference(image)

        # 2. Run inference
        raw_predictions = self.model.predict(input_array, verbose=0)[0]
        
        # 3. Probabilities as percentages rounded to 2 decimals
        probs_pct = (raw_predictions * 100.0).tolist()

        # 4. Top prediction
        top_idx = int(np.argmax(raw_predictions))
        top_confidence = round(float(probs_pct[top_idx]), 2)
        top_class_name = CLASS_NAMES[top_idx]
        top_icon = CLASS_ICONS[top_class_name]

        # 5. Build sorted rankings
        sorted_indices = np.argsort(raw_predictions)[::-1]

        all_sorted = []
        for idx in sorted_indices:
            idx = int(idx)
            name = CLASS_NAMES[idx]
            conf = round(float(probs_pct[idx]), 2)
            all_sorted.append({
                "class_name": name,
                "class_index": idx,
                "icon": CLASS_ICONS[name],
                "confidence": conf
            })

        top_3 = all_sorted[:3]

        probabilities_dict = {
            CLASS_NAMES[i]: round(float(probs_pct[i]), 2)
            for i in range(len(CLASS_NAMES))
        }

        return {
            "success": True,
            "prediction": {
                "class_name": top_class_name,
                "class_index": top_idx,
                "icon": top_icon,
                "confidence": top_confidence
            },
            "top_predictions": top_3,
            "probabilities": probabilities_dict,
            "all_classes_sorted": all_sorted
        }

# Global predictor service instance
predictor_service = CIFAR10Predictor()
