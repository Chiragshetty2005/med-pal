"""
Med-Pal Image Analysis Microservice
FastAPI service that accepts medical images and returns predictions.

Usage:
    uvicorn app:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

from model_loader import predict

app = FastAPI(
    title="Med-Pal Image Analysis",
    description="Medical image prediction microservice",
    version="1.0.0",
)

# Allow requests from the Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "image-analysis"}


@app.post("/predict")
async def predict_image(
    file: UploadFile = File(...),
    scan_type: str = Form(default="xray"),
):
    """
    Accept a medical image and return prediction results.
    
    - **file**: Image file (JPEG/PNG)
    - **scan_type**: One of 'xray', 'mri', 'ct' (default: 'xray')
    
    Returns:
        { prediction: str, confidence: float, type: str }
    """
    # Validate file type
    if file.content_type not in ("image/jpeg", "image/png", "image/jpg"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Only JPEG and PNG are accepted.",
        )

    try:
        # Read image bytes
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Run prediction
        result = predict(image, scan_type)
        return result

    except Exception as e:
        print(f"[Predict] Error processing image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
