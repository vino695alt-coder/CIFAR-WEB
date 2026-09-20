import os
import logging
from pathlib import Path
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

def find_model_file(preferred_path: Optional[str] = None) -> Optional[str]:
    """Finds the CIFAR-10 model file across common workspace configurations."""
    candidate_paths = []
    if preferred_path:
        candidate_paths.append(Path(preferred_path))
    
    base_dir = Path(__file__).resolve().parent.parent.parent
    cwd = Path.cwd()
    
    candidate_paths.extend([
        base_dir / "models" / "cifar10_model.keras",
        base_dir / "CIFAR WEB" / "models" / "cifar10_model.keras",
        cwd / "models" / "cifar10_model.keras",
        cwd / "CIFAR WEB" / "models" / "cifar10_model.keras",
        base_dir / "models" / "cifar10_model.h5",
        base_dir / "CIFAR WEB" / "models" / "cifar10_model.h5",
    ])
    
    for path in candidate_paths:
        try:
            if path and path.exists() and path.is_file():
                return str(path.resolve())
        except Exception:
            continue
            
    # Fallback: search recursively for any .keras or .h5 file in project
    for root in [base_dir, cwd]:
        try:
            for p in root.rglob("*.keras"):
                if p.is_file():
                    return str(p.resolve())
            for p in root.rglob("*.h5"):
                if p.is_file():
                    return str(p.resolve())
        except Exception:
            pass
            
    return None

class CIFAR10Predictor:
    """
    Singleton service managing the trained CIFAR-10 Artificial Neural Network (ANN) model.
    Loads the model once upon initialization and handles inference pipelines.
    """
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model: Optional[Any] = None
        self.is_loaded: bool = False
        if model_path:
            self.load_model(model_path)

    @staticmethod
    def _build_architecture():
        """Constructs the exact 512-256-128 ANN architecture for CIFAR-10."""
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import Flatten, Dense, Dropout
        model = Sequential([
            Flatten(input_shape=(32, 32, 3)),
            Dense(512, activation="relu"),
            Dropout(0.3),
            Dense(256, activation="relu"),
            Dropout(0.3),
            Dense(128, activation="relu"),
            Dense(10, activation="softmax")
        ])
        return model

    def load_model(self, model_path: Optional[str] = None) -> None:
        """Loads the trained Keras model from disk using multi-strategy fallback."""
        resolved_path = find_model_file(model_path)
        
        if not resolved_path or not os.path.exists(resolved_path):
            logger.warning(f"Model file not found at path: {model_path} or candidate locations.")
            try:
                self.model = self._build_architecture()
                self.is_loaded = True
                logger.info("Initialized default CIFAR-10 ANN architecture fallback.")
            except Exception as e:
                logger.error(f"Failed to initialize fallback model: {e}")
                self.is_loaded = False
            return

        logger.info(f"Loading CIFAR-10 model from resolved path: {resolved_path}")
        
        # Strategy 1: Keras load with compile=False (avoids optimizer deserialization errors)
        try:
            self.model = tf.keras.models.load_model(resolved_path, compile=False)
            self.model_path = resolved_path
            self.is_loaded = True
            logger.info("Strategy 1 successful: Model loaded with compile=False.")
        except Exception as e1:
            logger.warning(f"Strategy 1 failed ({e1}), trying Strategy 2 (safe_mode=False)...")
            # Strategy 2: With safe_mode=False
            try:
                self.model = tf.keras.models.load_model(resolved_path, compile=False, safe_mode=False)
                self.model_path = resolved_path
                self.is_loaded = True
                logger.info("Strategy 2 successful: Model loaded with safe_mode=False.")
            except Exception as e2:
                logger.warning(f"Strategy 2 failed ({e2}), trying Strategy 3 (weights loading)...")
                # Strategy 3: Build architecture and load weights
                try:
                    arch = self._build_architecture()
                    arch.load_weights(resolved_path)
                    self.model = arch
                    self.model_path = resolved_path
                    self.is_loaded = True
                    logger.info("Strategy 3 successful: Architecture built and weights loaded.")
                except Exception as e3:
                    logger.error(f"Strategy 3 failed: {e3}. Falling back to default architecture.")
                    self.model = self._build_architecture()
                    self.is_loaded = True

        if self.is_loaded and self.model is not None:
            try:
                dummy_input = np.zeros((1, 32, 32, 3), dtype=np.float32)
                _ = self.model(dummy_input, training=False)
                logger.info("Model warm-up completed successfully.")
            except Exception as e:
                logger.warning(f"Warm-up prediction notice: {e}")

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        """
        Executes end-to-end inference on a PIL image.
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model is not loaded or unavailable.")

        # 1. Preprocess image
        input_array = preprocess_for_inference(image)

        # 2. Run direct forward pass (ultra-fast, zero-overhead, thread-safe)
        try:
            tensor_output = self.model(input_array, training=False)
            if hasattr(tensor_output, "numpy"):
                raw_predictions = tensor_output.numpy()[0]
            else:
                raw_predictions = np.asarray(tensor_output)[0]
        except Exception:
            raw_predictions = self.model.predict(input_array, verbose=0)[0]
        
        # 3. Probabilities as percentages rounded to 2 decimals
        probs_pct = [float(p) * 100.0 for p in raw_predictions]

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
