import io
from PIL import Image
from werkzeug.datastructures import FileStorage

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
ALLOWED_FORMATS = {"PNG", "JPEG", "WEBP"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

class ValidationError(Exception):
    """Custom exception for image validation failures."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

def validate_image_file(file: FileStorage) -> Image.Image:
    """
    Validates the uploaded file for presence, extension, size, and image integrity.
    
    Returns:
        PIL.Image: Verified PIL Image object in RGB format.
    Raises:
        ValidationError: If validation fails with a user-friendly message.
    """
    if file is None or file.filename == "":
        raise ValidationError("Please select an image before predicting.", 400)

    # 1. Validate file extension
    filename = file.filename
    if "." not in filename:
        raise ValidationError("Unsupported file type. Please upload JPG, JPEG, PNG, or WEBP.", 400)

    ext = filename.rsplit(".", 1)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError("Unsupported file type. Please upload JPG, JPEG, PNG, or WEBP.", 400)

    # 2. Read bytes and check size
    file_bytes = file.read()
    if len(file_bytes) == 0:
        raise ValidationError("Please select an image before predicting.", 400)

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValidationError("Image is too large. Maximum file size is 5 MB.", 413)

    # 3. Validate image integrity with Pillow
    try:
        image_stream = io.BytesIO(file_bytes)
        image = Image.open(image_stream)
        image.verify()  # Verify integrity
    except Exception:
        raise ValidationError("We couldn't read this image. Please upload a valid image file.", 400)

    # Reset stream after verify and reopen for actual processing
    try:
        image_stream.seek(0)
        image = Image.open(image_stream)
        if image.format not in ALLOWED_FORMATS:
            raise ValidationError("Unsupported file type. Please upload JPG, JPEG, PNG, or WEBP.", 400)
        return image
    except ValidationError:
        raise
    except Exception:
        raise ValidationError("We couldn't read this image. Please upload a valid image file.", 400)
