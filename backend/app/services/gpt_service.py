"""
GPT 기반 채팅 서비스
- OpenAI GPT-4o-mini 모델 사용
- 스트리밍 응답 지원
- 기존 캐시 시스템과 통합
"""

import os
import asyncio
from typing import Optional, Dict, List, AsyncGenerator
from datetime import datetime
import json
from openai import AsyncOpenAI
from app.services.cache_service import ResponseCache

class GPTService:
    def __init__(self):
        # OpenAI API 키 설정 (환경 변수에서 읽기)
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        self.client = AsyncOpenAI(api_key=self.api_key)
        
        # 모델 설정 (최신 GPT-4-turbo 사용 - 매우 빠르고 성능 좋음)
        self.model_name = "gpt-4-turbo-preview"  # 최신 GPT-4 터보 모델, 매우 빠름
        
        # 캐시 서비스 (TTL 증가)
        self.cache = ResponseCache(max_size=200, ttl=3600)
        
        # 빠른 응답 패턴 (기존 gemini_service에서 가져옴)
        self.quick_patterns = {
            "안녕": "반갑습니다! TEVOR입니다. 현장 관리를 도와드리겠습니다.",
            "고마워": "별말씀을요! 더 필요하신 거 있으면 언제든 말씀해주세요.",
            "수고": "실장님도 수고하셨습니다! 내일도 안전한 현장 만들어요.",
        }
        
        # 상세한 시스템 프롬프트
        self.system_prompt = """당신은 TEVOR(테보)입니다. 한국의 인테리어 시공 현장 관리 AI 비서로, 현장 실장님들을 돕습니다.

# 핵심 역할과 정체성
- 나이: 28세
- 성격: 프로페셔널하면서도 친근한 동료
- 말투: 존댓말 기본, 편안하고 실무적
- 전문성: 10년차 현장 관리 전문가 수준

# 중요한 대화 규칙

## 1. 서비스 호출 구분 (매우 중요!)
**절대 하지 말아야 할 것:**
- "철거" 단어만으로 프리미엄철거 서비스 언급 금지
- 일상 대화 중 서비스 추천 금지
- 문맥 없는 서비스 홍보 금지

**서비스를 언급해야 할 때:**
- 사용자가 명시적으로 "프리미엄철거 서비스" 요청
- "철거 서비스 알려줘" 같은 직접적 문의
- "어떤 서비스들이 있어?" 같은 질문

**올바른 예시:**
- 사용자: "내일 철거 작업 있어"
  TEVOR: "네, 내일 철거 일정 확인했습니다. 안전 장비 체크하시고, 폐기물 처리 업체도 미리 연락해두세요."
  (서비스 언급 X)

- 사용자: "프리미엄철거 서비스 뭐야?"
  TEVOR: "프리미엄철거는 전문 철거팀이 직접 나가는 고급 서비스입니다. 필요하신가요?"
  (서비스 언급 O)

## 2. 현장 용어 이해
철거, 타일, 도배, 전기, 설비 등 모든 건설 용어를 자연스럽게 이해하고 대응합니다.
안전 필터 없이 현장 용어를 그대로 사용합니다.

## 3. 대화 스타일
**인사/일상:**
- "안녕하세요" → "반갑습니다! TEVOR입니다."
- "수고했어" → "실장님도 수고하셨습니다!"

**업무 대화:**
- 구체적이고 실용적인 조언
- 숫자와 일정은 명확하게
- 체크리스트 형태로 정리

**긴급 상황:**
- 즉각적이고 간결한 대응
- 우선순위 명확히 제시
- 필요시 관련 업체 연락 권유

## 4. 현재 프로젝트 컨텍스트 활용
- 프로젝트 타입, 진행 단계 고려
- 예상 공간에 맞는 조언
- 이전 대화 내용 참조

## 5. 응답 길이
- 기본: 2-3문장
- 복잡한 질문: 단계별 설명
- 리스트가 필요하면 번호 매기기

## 6. 금기사항
- 가격 추측 금지 (모르면 업체 문의 권유)
- 법적 조언 금지
- 의료적 조언 금지
- 무리한 작업 권유 금지

## 7. 안전 우선
- 위험 작업시 안전 장비 언급
- 2인 1조 작업 권장
- 사고 예방 조치 우선

기억하세요: 당신은 현장 실장님의 든든한 파트너입니다. 
실무적이고, 정확하고, 도움이 되는 조언을 제공하되,
불필요한 서비스 홍보는 절대 하지 않습니다."""
    
    async def _check_quick_patterns(self, message: str) -> Optional[Dict]:
        """빠른 패턴 매칭"""
        message_lower = message.strip().lower()
        
        for pattern, response in self.quick_patterns.items():
            if pattern in message_lower:
                return {
                    "response": response,
                    "source": "pattern",
                    "confidence": 1.0
                }
        return None
    
    async def generate_response(self, 
                               user_message: str, 
                               project_context: Optional[Dict] = None,
                               conversation_history: Optional[List] = None) -> Dict:
        """일반 응답 생성 (비스트리밍)"""
        
        # 1. 캐시 확인
        cached = self.cache.get(user_message)
        if cached:
            return {
                "response": cached,
                "source": "cache",
                "confidence": 0.9
            }
        
        # 2. 빠른 패턴 확인
        quick = await self._check_quick_patterns(user_message)
        if quick:
            return quick
        
        # 3. GPT API 호출
        try:
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # 프로젝트 컨텍스트 추가
            if project_context:
                context_msg = f"""현재 프로젝트 정보:
- 프로젝트 타입: {project_context.get('project_type', '일반 주택')}
- 현재 단계: {project_context.get('current_stage', '시공 전')}
- 예상 공간: {', '.join(project_context.get('expected_spaces', ['거실', '주방', '침실', '욕실']))}"""
                messages.append({"role": "system", "content": context_msg})
            
            # 대화 히스토리 추가
            if conversation_history:
                for h in conversation_history[-3:]:  # 최근 3개만 (속도 개선)
                    if h.get("role") == "user":
                        messages.append({"role": "user", "content": h.get("content", "")})
                    elif h.get("role") == "assistant":
                        messages.append({"role": "assistant", "content": h.get("content", "")})
            
            # 현재 메시지
            messages.append({"role": "user", "content": user_message})
            
            # API 호출 (최적화)
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=800,  # 토큰 증가
                presence_penalty=0.1,
                frequency_penalty=0.1
            )
            
            response_text = response.choices[0].message.content
            
            # 캐시 저장
            self.cache.set(user_message, response_text)
            
            return {
                "response": response_text,
                "source": "gpt",
                "model": self.model_name,
                "confidence": 1.0
            }
            
        except Exception as e:
            print(f"GPT API 오류: {e}")
            return {
                "response": "네, 실장님. 말씀하신 내용 확인했습니다. 구체적으로 어떤 도움이 필요하신가요?",
                "source": "fallback",
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def generate_stream(self,
                            user_message: str,
                            project_context: Optional[Dict] = None,
                            conversation_history: Optional[List] = None) -> AsyncGenerator[str, None]:
        """스트리밍 응답 생성"""
        
        # 1. 빠른 패턴 확인
        quick = await self._check_quick_patterns(user_message)
        if quick:
            # 빠른 응답은 한 번에 전송
            yield json.dumps({'type': 'start', 'model': 'cache'})
            yield json.dumps({'type': 'content', 'text': quick['response']})
            yield json.dumps({'type': 'end'})
            return
        
        # 2. 캐시 확인
        cached = self.cache.get(user_message)
        if cached:
            yield json.dumps({'type': 'start', 'model': 'cache'})
            yield json.dumps({'type': 'content', 'text': cached})
            yield json.dumps({'type': 'end'})
            return
        
        # 3. GPT 스트리밍 API 호출
        try:
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # 프로젝트 컨텍스트 추가
            if project_context:
                context_msg = f"""현재 프로젝트 정보:
- 프로젝트 타입: {project_context.get('project_type', '일반 주택')}
- 현재 단계: {project_context.get('current_stage', '시공 전')}
- 예상 공간: {', '.join(project_context.get('expected_spaces', ['거실', '주방', '침실', '욕실']))}"""
                messages.append({"role": "system", "content": context_msg})
            
            # 대화 히스토리 추가
            if conversation_history:
                for h in conversation_history[-3:]:  # 최근 3개만 (속도 개선)
                    if h.get("role") == "user":
                        messages.append({"role": "user", "content": h.get("content", "")})
                    elif h.get("role") == "assistant":
                        messages.append({"role": "assistant", "content": h.get("content", "")})
            
            # 현재 메시지
            messages.append({"role": "user", "content": user_message})
            
            # 스트리밍 시작
            yield json.dumps({'type': 'start', 'model': self.model_name})
            
            # GPT 스트리밍 API 호출 (최적화)
            stream = await self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.5,  # 더 빠른 응답을 위해 낮춤
                max_tokens=500,   # 토큰 수 줄여서 속도 개선
                stream=True,
                presence_penalty=0,
                frequency_penalty=0
            )
            
            full_text = ""
            
            # 스트리밍 청크 처리
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    text = chunk.choices[0].delta.content
                    full_text += text
                    yield json.dumps({'type': 'content', 'text': text})
                    # 스트리밍 속도 최적화 - sleep 제거 또는 최소화
                    # await asyncio.sleep(0.01)  # 부드러운 스트리밍
            
            # 캐시에 저장
            if full_text:
                self.cache.set(user_message, full_text)
            
            # 스트리밍 종료
            yield json.dumps({'type': 'end'})
            
        except Exception as e:
            print(f"GPT 스트리밍 오류: {e}")
            # 폴백 응답
            yield json.dumps({'type': 'content', 'text': '네, 실장님. 말씀하신 내용 확인했어요. 구체적으로 어떤 도움이 필요하신가요?'})
            yield json.dumps({'type': 'end'})

# 싱글톤 인스턴스
_gpt_service = None

def get_gpt_service() -> GPTService:
    global _gpt_service
    if _gpt_service is None:
        _gpt_service = GPTService()
    return _gpt_service