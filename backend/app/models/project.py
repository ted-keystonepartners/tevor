from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    
    # 🆕 Context Injection을 위한 프로젝트 메타데이터
    current_stage = Column(String, default="시공 전", index=True)  # 현재 공정 단계
    expected_spaces = Column(JSON, nullable=True)  # 예상 공간 리스트 ["거실", "주방", "침실1", "침실2"]
    project_type = Column(String, default="일반 주택")  # 프로젝트 유형 (아파트, 오피스텔, 상가 등)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # 최신순 정렬 최적화
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)  # 수정순 정렬 최적화