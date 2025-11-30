from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, Index, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class ImageRecord(Base):
    __tablename__ = "image_records"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(String, unique=True, index=True)
    project_id = Column(String, ForeignKey("projects.project_id"), index=True)  # 프로젝트별 조회 최적화
    
    # 🆕 고도화된 메타데이터 필드들 (Gemini 분석 결과)
    space_value = Column(String, index=True)  # 거실, 주방, 침실 등
    space_confidence = Column(Float)
    stage_value = Column(String, index=True)  # 시공 전, 마감 중 등
    stage_confidence = Column(Float)
    trade_primary = Column(String, index=True)  # 목공, 타일, 도장 등
    condition_value = Column(String)  # 일반 시공, 하자/문제 발생 등
    
    # 🆕 의미 검색을 위한 텍스트 필드들 
    reasoning = Column(Text)  # Gemini의 추론 근거 (벡터 검색용)
    description_ko = Column(Text)  # 아카이빙용 상세 설명 (벡터 검색용)
    keywords_json = Column(JSON)  # ["포세린 타일", "접착제", "줄눈"] 검색 태그
    is_valid_construction = Column(Boolean, default=True)  # Gemini 유효성 검사 결과
    
    # 기존 필드들 (레거시 호환)
    image_type = Column(String, index=True)  # 타입별 조회 최적화 (레거시)
    confidence = Column(Float)  # 전체 분석 신뢰도
    analysis = Column(Text)  # 전체 분석 결과 JSON string (레거시)
    storage_path = Column(String)  # 🔄 Flat Path 구조로 변경: /assets/2025/11/{uuid}.jpg
    original_filename = Column(String)
    caption = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # 시간순 정렬 최적화

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String, unique=True, index=True)
    project_id = Column(String, ForeignKey("projects.project_id"), index=True)  # 프로젝트별 조회 최적화
    user_message = Column(Text)
    ai_response = Column(Text)
    rag_context = Column(Text, nullable=True)  # JSON string
    confidence = Column(Float, nullable=True)
    server_image_url = Column(String, nullable=True)  # 서버 저장 이미지 URL
    image_filename = Column(String, nullable=True)  # 원본 파일명
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # 시간순 정렬 최적화

# 🆕 고도화된 복합 인덱스 정의 - 의미 검색 및 메타데이터 쿼리 최적화
Index('idx_image_project_created', ImageRecord.project_id, ImageRecord.created_at)  # 프로젝트별 시간순 이미지 조회
Index('idx_image_project_space', ImageRecord.project_id, ImageRecord.space_value)  # 프로젝트별 공간별 이미지 조회
Index('idx_image_project_stage', ImageRecord.project_id, ImageRecord.stage_value)  # 프로젝트별 단계별 이미지 조회
Index('idx_image_space_stage', ImageRecord.space_value, ImageRecord.stage_value)  # 공간+단계 조합 검색
Index('idx_image_trade_valid', ImageRecord.trade_primary, ImageRecord.is_valid_construction)  # 공종별 유효 이미지
Index('idx_chat_project_created', ChatMessage.project_id, ChatMessage.created_at)  # 프로젝트별 시간순 채팅 조회

# 🔍 의미 검색을 위한 전문 검색 인덱스 (PostgreSQL의 경우)
# Index('idx_image_reasoning_search', ImageRecord.reasoning.op('gin')())  # GIN 인덱스 (나중에 벡터 검색 시 활용)
# Index('idx_image_description_search', ImageRecord.description_ko.op('gin')())  # GIN 인덱스

# 레거시 호환 인덱스
Index('idx_image_project_type', ImageRecord.project_id, ImageRecord.image_type)  # 프로젝트별 타입별 이미지 조회 (레거시)
Index('idx_image_type_created', ImageRecord.image_type, ImageRecord.created_at)  # 타입별 시간순 이미지 조회 (레거시)