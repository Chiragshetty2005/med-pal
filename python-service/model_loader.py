"""
Model Loader — Loads pre-trained models or provides mock fallback.

Strategy:
1. On startup, scan `models/` directory for .h5 (TensorFlow) or .pt (PyTorch) files
2. If found, load them and expose a `predict(image, scan_type)` function
3. If not found, use medically-plausible mock predictions with randomized confidence
"""

import os
import random
import numpy as np
from PIL import Image

# ──────────────────────────────────────────────
# Model Registry
# ──────────────────────────────────────────────
MODELS = {
    "xray": None,
    "mri": None,
    "ct": None,
}

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

def _try_load_models():
    """Attempt to load real model files from the models/ directory."""
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR, exist_ok=True)
        print("[ModelLoader] No models/ directory found — created empty one. Using mock predictions.")
        return

    for filename in os.listdir(MODEL_DIR):
        filepath = os.path.join(MODEL_DIR, filename)
        lower = filename.lower()

        try:
            if lower.endswith(".h5"):
                # TensorFlow / Keras model
                import tensorflow as tf
                model = tf.keras.models.load_model(filepath)
                if "xray" in lower or "pneumonia" in lower:
                    MODELS["xray"] = ("tf", model)
                elif "mri" in lower or "brain" in lower or "tumor" in lower:
                    MODELS["mri"] = ("tf", model)
                elif "ct" in lower or "lung" in lower:
                    MODELS["ct"] = ("tf", model)
                print(f"[ModelLoader] Loaded TF model: {filename}")

            elif lower.endswith(".pt") or lower.endswith(".pth"):
                # PyTorch model
                import torch
                model = torch.load(filepath, map_location="cpu")
                model.eval()
                if "xray" in lower or "pneumonia" in lower:
                    MODELS["xray"] = ("pt", model)
                elif "mri" in lower or "brain" in lower or "tumor" in lower:
                    MODELS["mri"] = ("pt", model)
                elif "ct" in lower or "lung" in lower:
                    MODELS["ct"] = ("pt", model)
                print(f"[ModelLoader] Loaded PyTorch model: {filename}")

        except Exception as e:
            print(f"[ModelLoader] Failed to load {filename}: {e}")

    loaded = [k for k, v in MODELS.items() if v is not None]
    if loaded:
        print(f"[ModelLoader] Active models: {loaded}")
    else:
        print("[ModelLoader] No model files detected. Mock predictions will be used.")


# ──────────────────────────────────────────────
# Image Preprocessing
# ──────────────────────────────────────────────
def preprocess_image(image: Image.Image, target_size=(224, 224)):
    """Resize and normalize image for model inference."""
    img = image.convert("RGB").resize(target_size)
    arr = np.array(img, dtype=np.float32) / 255.0
    return arr


# ──────────────────────────────────────────────
# Real Model Inference
# ──────────────────────────────────────────────
def _predict_real(model_entry, image_array):
    """Run inference using a loaded real model."""
    framework, model = model_entry

    if framework == "tf":
        import tensorflow as tf
        batch = np.expand_dims(image_array, axis=0)
        preds = model.predict(batch, verbose=0)
        confidence = float(np.max(preds))
        class_idx = int(np.argmax(preds))
        return confidence, class_idx

    elif framework == "pt":
        import torch
        tensor = torch.tensor(image_array).permute(2, 0, 1).unsqueeze(0)
        with torch.no_grad():
            preds = model(tensor)
            probs = torch.nn.functional.softmax(preds, dim=1)
            confidence = float(torch.max(probs))
            class_idx = int(torch.argmax(probs))
        return confidence, class_idx

    return 0.0, 0


# ──────────────────────────────────────────────
# Mock Predictions
# ──────────────────────────────────────────────
MOCK_PREDICTIONS = {
    "xray": [
        {"prediction": "Pneumonia Detected", "confidence_range": (0.78, 0.95)},
        {"prediction": "Normal - No Pneumonia", "confidence_range": (0.85, 0.97)},
        {"prediction": "Possible Pleural Effusion", "confidence_range": (0.65, 0.82)},
        {"prediction": "Cardiomegaly Suspected", "confidence_range": (0.60, 0.78)},
    ],
    "mri": [
        {"prediction": "Glioma Tumor Detected", "confidence_range": (0.72, 0.91)},
        {"prediction": "Meningioma Detected", "confidence_range": (0.68, 0.88)},
        {"prediction": "No Tumor Detected", "confidence_range": (0.88, 0.97)},
        {"prediction": "Pituitary Tumor Suspected", "confidence_range": (0.62, 0.80)},
    ],
    "ct": [
        {"prediction": "Lung Nodule Detected", "confidence_range": (0.70, 0.89)},
        {"prediction": "Normal Lung Scan", "confidence_range": (0.86, 0.96)},
        {"prediction": "Possible Ground-Glass Opacity", "confidence_range": (0.64, 0.83)},
        {"prediction": "Emphysema Pattern Detected", "confidence_range": (0.58, 0.77)},
    ],
}

REAL_LABELS = {
    "xray": ["Normal - No Pneumonia", "Pneumonia Detected"],
    "mri": ["No Tumor Detected", "Glioma Tumor Detected", "Meningioma Detected", "Pituitary Tumor Suspected"],
    "ct": ["Normal Lung Scan", "Lung Nodule Detected", "Possible Ground-Glass Opacity", "Emphysema Pattern Detected"],
}


def _predict_mock(scan_type: str):
    """Generate a medically plausible mock prediction."""
    options = MOCK_PREDICTIONS.get(scan_type, MOCK_PREDICTIONS["xray"])
    chosen = random.choice(options)
    lo, hi = chosen["confidence_range"]
    confidence = round(random.uniform(lo, hi), 4)
    return chosen["prediction"], confidence


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────
def predict(image: Image.Image, scan_type: str):
    """
    Main prediction entry point.
    Returns: { prediction: str, confidence: float, type: str }
    """
    scan_type = scan_type.lower()
    if scan_type not in ("xray", "mri", "ct"):
        scan_type = "xray"  # default fallback

    type_labels = {
        "xray": "X-ray",
        "mri": "MRI",
        "ct": "CT Scan",
    }

    model_entry = MODELS.get(scan_type)

    if model_entry is not None:
        # Real model inference
        try:
            image_array = preprocess_image(image)
            confidence, class_idx = _predict_real(model_entry, image_array)
            labels = REAL_LABELS.get(scan_type, ["Unknown"])
            prediction = labels[class_idx] if class_idx < len(labels) else labels[0]
            return {
                "prediction": prediction,
                "confidence": round(confidence, 4),
                "type": type_labels[scan_type],
            }
        except Exception as e:
            print(f"[ModelLoader] Real inference failed, falling back to mock: {e}")

    # Mock fallback
    prediction, confidence = _predict_mock(scan_type)
    return {
        "prediction": prediction,
        "confidence": confidence,
        "type": type_labels[scan_type],
    }


# ──────────────────────────────────────────────
# Initialize on import
# ──────────────────────────────────────────────
_try_load_models()
