import numpy as np
from PIL import Image

def preprocess_for_inference(image: Image.Image) -> np.ndarray:
    """
    Transforms a PIL Image into the exact normalized array expected by the CIFAR-10 ANN model.
    
    Steps:
      1. Convert to RGB (handles RGBA, grayscale, CMYK, etc.)
      2. Resize to 32x32 pixels using high-quality bilinear interpolation
      3. Convert to float32 NumPy array
      4. Normalize by dividing by 255.0 to map range to [0.0, 1.0]
      5. Expand dimensions to (1, 32, 32, 3) batch shape
    
    Args:
        image (PIL.Image.Image): Raw uploaded PIL image
        
    Returns:
        np.ndarray: Preprocessed array of shape (1, 32, 32, 3) with float32 values in [0.0, 1.0]
    """
    # 1. Convert to RGB
    rgb_image = image.convert("RGB")
    
    # 2. Resize to 32x32
    resized_image = rgb_image.resize((32, 32), Image.Resampling.BILINEAR)
    
    # 3 & 4. Convert to float32 and normalize [0, 1]
    img_array = np.array(resized_image, dtype=np.float32) / 255.0
    
    # 5. Add batch dimension -> (1, 32, 32, 3)
    batch_array = np.expand_dims(img_array, axis=0)
    
    return batch_array
