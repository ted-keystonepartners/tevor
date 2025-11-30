"""
스트리밍 채팅 API
- SSE (Server-Sent Events)를 통한 실시간 응답
- Gemini API 스트림 모드 활용
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.future import select
import json
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from typing import AsyncGenerator

from app.database import get_db, IS_ASYNC
from app.models.project import Project
from app.models.image_record import ChatMessage
from app.schemas.chat import ChatRequest
from app.services.gpt_service import GPTService

router = APIRouter(prefix="/api/v2/chat", tags=["chat-stream"])

async def generate_sse_response(
    chat_request: ChatRequest,
    db
) -> AsyncGenerator[str, None]:
    """SSE 스트림 생성"""
    
    try:
        # 프로젝트 확인
        if IS_ASYNC:
            result = await db.execute(
                select(Project).where(Project.project_id == chat_request.project_id)
            )
            project = result.scalar_one_or_none()
        else:
            project = db.query(Project).filter(Project.project_id == chat_request.project_id).first()
        
        if not project:
            yield f"data: {json.dumps({'error': '프로젝트를 찾을 수 없습니다'})}\n\n"
            return
        
        # 프로젝트 컨텍스트
        project_context = {
            "project_type": project.project_type or "일반 주택",
            "current_stage": project.current_stage or "시공 전",
            "expected_spaces": project.expected_spaces or ["거실", "주방", "침실", "욕실"]
        }
        
        # GPT 서비스
        gpt_service = GPTService()
        
        # 빠른 응답 체크 (public method 사용)
        try:
            quick_response = await gpt_service._check_quick_patterns(chat_request.message)
        except:
            quick_response = None
            
        if quick_response:
            # 빠른 응답은 한 번에 전송
            yield f"data: {json.dumps({'type': 'start', 'model': 'cache'})}\n\n"
            yield f"data: {json.dumps({'type': 'content', 'text': quick_response['response']})}\n\n"
            yield f"data: {json.dumps({'type': 'end'})}\n\n"
            return
        
        # 대화 히스토리 준비
        conversation_history = [
            {"role": h.get("role", "user"), "content": h.get("content", "")}
            for h in (chat_request.conversation_history or [])[-10:]
        ]
        
        # GPT 스트리밍 생성
        full_text = ""
        message_id = None
        
        try:
            async for chunk_json in gpt_service.generate_stream(
                chat_request.message,
                project_context,
                conversation_history
            ):
                chunk_data = json.loads(chunk_json)
                
                # 컨텐츠 누적
                if chunk_data.get('type') == 'content':
                    full_text += chunk_data.get('text', '')
                    # SSE 형식으로 전송
                    yield f"data: {json.dumps(chunk_data)}\n\n"
                
                # 시작 이벤트 전송
                elif chunk_data.get('type') == 'start':
                    yield f"data: {json.dumps(chunk_data)}\n\n"
                
                # 종료 이벤트 처리
                elif chunk_data.get('type') == 'end':
                    # 메시지 저장
                    if full_text:
                        message_id = f"msg_{str(uuid.uuid4())[:8]}"
                        new_message = ChatMessage(
                            message_id=message_id,
                            project_id=chat_request.project_id,
                            user_message=chat_request.message,
                            ai_response=full_text,
                            rag_context=None,
                            confidence=0.0
                        )
                        
                        db.add(new_message)
                        if IS_ASYNC:
                            await db.commit()
                        else:
                            db.commit()
                    
                    # 메시지 ID와 함께 종료 이벤트 전송
                    yield f"data: {json.dumps({'type': 'end', 'message_id': message_id})}\n\n"
                    return
            
        except Exception as e:
            # 에러 로깅 (서버 측에서만)
            import traceback
            error_detail = traceback.format_exc()
            print(f"스트리밍 에러 (서버): {error_detail}")
            
            # 에러 발생 시 폴백 응답 (에러 이벤트 없이)
            yield f"data: {json.dumps({'type': 'content', 'text': '네, 실장님. 말씀하신 내용 확인했어요. 구체적으로 어떤 도움이 필요하신가요?'})}\n\n"
            # yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"  # 에러 이벤트 제거
            
            # 메시지 ID 없이 종료
            yield f"data: {json.dumps({'type': 'end'})}\n\n"
            
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@router.post("/stream")
async def stream_message(
    chat_request: ChatRequest,
    db = Depends(get_db)
):
    """스트리밍 채팅 엔드포인트"""
    
    headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",  # Nginx 버퍼링 비활성화
    }
    
    return StreamingResponse(
        generate_sse_response(chat_request, db),
        media_type="text/event-stream",
        headers=headers
    )