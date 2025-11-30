from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatRequest(BaseModel):
    project_id: str
    message: str
    conversation_history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    id: int
    message_id: str
    response: str
    confidence: Optional[float] = None
    rag_context: Optional[dict] = None
    created_at: datetime
    model_info: Optional[dict] = None
    server_image_url: Optional[str] = None  # 서버 저장 이미지 URL

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None
    created_at: datetime