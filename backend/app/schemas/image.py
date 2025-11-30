from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ImageAnalysis(BaseModel):
    description: str
    detected_type: str
    elements: Optional[list] = []
    issues: Optional[list] = []

class ImageUploadResponse(BaseModel):
    image_id: str
    image_type: str
    confidence: float
    analysis: ImageAnalysis
    storage_path: str
    timestamp: datetime