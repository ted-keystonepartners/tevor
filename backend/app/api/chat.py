"""
새로운 단순화된 채팅 API
- 통합 Gemini 서비스 사용
- 빠른 응답, 단순한 구조
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import Dict, Any
import uuid
from datetime import datetime, timezone, timedelta

from app.database import get_db, IS_ASYNC
from app.models.project import Project
from app.models.image_record import ChatMessage
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gpt_service import GPTService

router = APIRouter(prefix="/api/v2/chat", tags=["chat-v2"])

@router.post("/message", response_model=ChatResponse)
async def send_message_v2(
    chat_request: ChatRequest,
    db = Depends(get_db)
):
    """새로운 단순화된 채팅 API"""
    try:
        # 프로젝트 존재 확인
        if IS_ASYNC:
            result = await db.execute(
                select(Project).where(Project.project_id == chat_request.project_id)
            )
            project = result.scalar_one_or_none()
        else:
            project = db.query(Project).filter(Project.project_id == chat_request.project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=404, 
                detail=f"프로젝트를 찾을 수 없습니다: {chat_request.project_id}"
            )
        
        # 프로젝트 컨텍스트 구성
        project_context = {
            "project_type": project.project_type or "일반 주택",
            "current_stage": project.current_stage or "시공 전",
            "expected_spaces": project.expected_spaces or ["거실", "주방", "침실", "욕실"]
        }
        
        # GPT 서비스로 응답 생성
        gpt_service = GPTService()
        gpt_result = await gpt_service.chat_response(
            message=chat_request.message,
            project_context=project_context
        )
        
        if not gpt_result.get("success", False):
            raise HTTPException(
                status_code=500,
                detail=f"AI 응답 생성 실패: {gpt_result.get('error', 'Unknown error')}"
            )
        
        # 메시지 ID 생성
        message_id = f"msg_{str(uuid.uuid4())[:8]}"
        
        # DB에 채팅 기록 저장
        new_message = ChatMessage(
            message_id=message_id,
            project_id=chat_request.project_id,
            user_message=chat_request.message,
            ai_response=gpt_result["response"],
            rag_context=None,  # 새 버전에서는 RAG 없음
            confidence=0.0
        )
        
        db.add(new_message)
        if IS_ASYNC:
            await db.commit()
            await db.refresh(new_message)
        else:
            db.commit()
            db.refresh(new_message)
        
        # 한국 시간으로 변환 (UTC + 9시간)
        kst_time = new_message.created_at.replace(tzinfo=timezone.utc) + timedelta(hours=9)
        
        # 응답 구성
        return ChatResponse(
            id=new_message.id,
            message_id=message_id,
            response=gpt_result["response"],
            confidence=0.0,
            rag_context=None,
            created_at=kst_time,
            model_info={
                "model_name": gpt_result.get("model", "gpt-4o-mini"),
                "provider": "openai",
                "quick_response": gpt_result.get("quick_response", False)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"채팅 처리 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/history/{project_id}")
async def get_chat_history_v2(
    project_id: str,
    skip: int = 0,
    limit: int = 50,
    db = Depends(get_db)
):
    """채팅 히스토리 조회"""
    try:
        # 프로젝트 존재 확인
        if IS_ASYNC:
            result = await db.execute(
                select(Project).where(Project.project_id == project_id)
            )
            project = result.scalar_one_or_none()
        else:
            project = db.query(Project).filter(Project.project_id == project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=404,
                detail=f"프로젝트를 찾을 수 없습니다: {project_id}"
            )
        
        # 채팅 메시지 조회
        if IS_ASYNC:
            result = await db.execute(
                select(ChatMessage)
                .where(ChatMessage.project_id == project_id)
                .order_by(ChatMessage.created_at.desc())
                .offset(skip)
                .limit(limit)
            )
            messages = result.scalars().all()
        else:
            messages = db.query(ChatMessage).filter(
                ChatMessage.project_id == project_id
            ).order_by(ChatMessage.created_at.desc()).offset(skip).limit(limit).all()
        
        # 응답 구성 - 단순 텍스트 메시지만
        chat_history = []
        for message in reversed(messages):  # 시간순 정렬
            # 사용자 메시지
            chat_history.append({
                "id": f"{message.message_id}_user",
                "type": "user",
                "content": message.user_message,
                "timestamp": message.created_at.isoformat()
            })
            
            # AI 응답
            chat_history.append({
                "id": f"{message.message_id}_ai",
                "type": "assistant",
                "content": message.ai_response,
                "timestamp": message.created_at.isoformat(),
                "confidence": message.confidence or 0.0,
                "rag_context": message.rag_context
            })
        
        return {
            "messages": chat_history,
            "total": len(messages) * 2,  # user + ai 메시지
            "project_id": project_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"채팅 히스토리 조회 중 오류가 발생했습니다: {str(e)}"
        )

# 이미지 업로드 기능은 제거됨 - 새로운 설계로 대체 예정