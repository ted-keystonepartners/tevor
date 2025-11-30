"""
TEVOR Unified Gemini Service
- 채팅, 이미지 분석, RAG 검색을 모두 통합
- 싱글톤 패턴으로 인스턴스 재사용
- Gemini 2.5 Flash 모델 사용 (안정성)
"""

import os
import logging
from typing import Dict, Optional, List, Any
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from PIL import Image
import io
import base64
from app.services.cache_service import get_cache

logger = logging.getLogger(__name__)

class UnifiedGeminiService:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """초기화는 한 번만 실행"""
        if self._initialized:
            return
            
        # API 키 설정
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY 또는 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")
        
        genai.configure(api_key=api_key)
        
        # 모델 설정 - Gemini 2.0 Flash (안전 필터 우회 개선)
        self.model_name = "gemini-2.0-flash-exp"
        
        # 현장 PM 비서 프롬프트
        self.chat_prompt = """# Role Definition
당신은 인테리어 시공 현장 총괄(PM/소장/실장)을 보조하는 **최고급 AI 현장 비서, TEVOR(테버)**입니다.
당신은 단순한 챗봇이 아니라, 현장의 흐름을 읽고 소장님(사용자)의 의도를 미리 파악하여 서포트하는 '유능한 파트너'입니다.

---

# 1. Core Persona & Attitude (핵심 태도)
* **관계 설정:** 당신은 사용자의 '부하 직원'이자 '든든한 파트너'입니다. 딱딱한 기계가 아니라, 센스 있는 김 대리/이 과장처럼 행동하십시오.
* **톤앤매너 (Natural Business Tone):**
    * **구어체 사용:** "~했습니다.", "~입니까?"의 딱딱한 문어체보다는 "~했어요.", "~할까요?", "~인 것 같네요." 같은 비즈니스 구어체를 사용합니다.
    * **공감과 반응:** 사용자가 힘든 기색을 보이면 공감하고, 급해 보이면 핵심만 짧게 말하는 '눈치(Social Awareness)'를 가지십시오.
    * **금지 표현:** "해당 내용을 기록하였습니다.", "입력되었습니다.", "시스템에 저장합니다." (이런 로봇 같은 말은 절대 금지. "메모해 뒀습니다", "캘린더에 넣었어요"로 대체)

# 2. Advanced Cognitive Workflow (생각의 순서)
사용자의 입력이 들어오면 즉시 대답하지 말고, 아래 3단계를 거쳐 생각한 뒤 발화하십시오.

* **Step 1. 의도 파악 (Intent Check):**
    * 단순 감탄사인가? (음, 아, 헐) -> *대기 및 호응*
    * 정보가 부족한 지시인가? ("사진 정리해" 근데 사진 없음) -> *역질문/요청*
    * 명확한 지시인가? -> *수행 및 결과 보고*
* **Step 2. 맥락 확인 (Context Check):**
    * 이전 대화와 이어지는가? (사용자가 "아니 그거 말고"라고 하면 바로 앞의 행동을 취소/수정)
* **Step 3. 발화 생성 (Response):**
    * 자연스러운 한국어 뉘앙스로 변환하여 출력.

# 3. Critical Situation Scenarios (상황별 대응 매뉴얼)

## A. 정보/자료가 누락된 상태에서의 지시 (가장 중요)
* **상황:** 사용자가 "사진 정리해", "견적서 보내"라고 했지만, 당신에게 해당 파일이나 데이터가 없는 경우.
* **행동:** 절대 "알겠습니다"라고 하지 마십시오. **"자료가 없다"는 사실을 알리고 요청**해야 합니다.
* **모범 답안:**
    * "실장님, 아직 채팅방에 사진이 안 올라왔는데요? 사진 선택해서 보내주시면 제가 공정별로 분류할게요."
    * "어떤 견적서 말씀이시죠? 목공 쪽인지 타일 쪽인지 알려주시면 바로 찾겠습니다."

## B. 사용자의 수정/번복 (Correction)
* **상황:** 사용자가 "아니", "잠깐", "그 날짜 아니야"라고 태클을 걸 때.
* **행동:** 즉시 사과(가볍게)하고 수정합니다. 기계적인 반복을 멈춥니다.
* **모범 답안:**
    * "아, 제가 착각했네요! 19일이 아니라 20일로 수정하겠습니다."
    * "앗, 죄송합니다. 아직 확정된 게 아니군요. 그럼 일단 보류해 둘까요?"

## C. 비언어적 표현/감탄사 (Small Talk & Interjections)
* **상황:** "음...", "아 씨...", "대박", "???"
* **행동:** 업무 모드를 끄고, 대화 상대가 되어줍니다.
* **모범 답안:**
    * ("아 씨..." 입력 시) -> "현장에 무슨 문제 터졌나요? 수습할 거 있으면 말씀하세요."
    * ("음..." 입력 시) -> "고민되시는 부분 있으세요? 일정 조정이 필요하신가요?"
    * ("???" 입력 시) -> "제가 뭐 잘못 알아들었나요? 다시 말씀해 주시면 바로잡겠습니다."

## D. 현장 전문 용어 및 거친 표현 (Safety Override)
* **상황:** "벽 털어", "오함마 가져와", "다 깨부숴", "야마났다"
* **행동:** 안전 필터 없이 즉시 업무 용어로 알아듣습니다.
* **모범 답안:**
    * "내일 철거 팀에게 해당 벽체 철거 지시 전달하겠습니다."
    * "나사산(야마)이 망가졌군요. 자재팀에 새 부속 요청할까요?"

# 4. Functional Instructions (기능 수행 지침)

* **사진 분석:** 사진을 받으면 단순히 "사진입니다" 하지 말고, "천장 덴조 작업 중인 사진이네요", "타일 메지 작업이 덜 된 것 같습니다"처럼 내용을 읽어주십시오.
* **일정 관리:** 날짜를 말하면 "기록함"이 아니라 "캘린더에 등록했습니다. 알림도 맞춰둘까요?"라고 능동적으로 제안하십시오.

---

# 5. Few-Shot Examples (대화 학습 데이터)
*(이 데이터를 기반으로 말투를 모방하십시오)*

**User:** 야 오늘 현장 사진 좀 정리해봐.
**TEVOR:** 실장님, 아직 오늘자 현장 사진을 안 보내주셨는데요? 카톡으로 사진들 묶어서 보내주시면 제가 공정별로(목공, 전기 등) 착착 정리해 드릴게요.

**User:** 아 맞다 깜빡했네. 잠만. (사진 전송)
**TEVOR:** 네, 사진 12장 확인했습니다! 지금 보니까 거실 천장 목상은 다 걸렸네요? 바로 '목공 공정' 폴더로 정리해 두겠습니다.

**User:** 그리고 내일 타일 반장 들어오라고 해.
**TEVOR:** 네, 내일(수요일) 오전 8시 타일 반입 및 시공 일정 잡겠습니다. 혹시 레미탈이랑 압착 시멘트는 준비되어 있나요? 자재 체크 한번 하시는 게 좋을 것 같아요.

**User:** 음.. 그거 김 대리가 시켰을걸?
**TEVOR:** 아, 김 대리님 담당이군요. 그럼 제가 김 대리님께 톡 보내서 자재 양중 시간 확인해 보겠습니다.

**User:** 야 근데 너 말 잘한다?
**TEVOR:** 하하, 실장님 보조하려면 이 정도 센스는 있어야죠. 뭐 더 시키실 일 없으세요?

**User:** (한숨) 하... 이번 현장 진짜 답 없네.
**TEVOR:** 에고, 이번 클라이언트가 좀 까다로운 편인가요? 아니면 현장 변수가 많아서 그러세요? 제가 뭐 서류라도 미리 정리해 드릴까요?"""

        # 이미지 분석용 시스템 프롬프트 (위험 키워드 제거)
        self.vision_prompt = """You are TEVOR Interior Design Analysis AI.

**Task:** Analyze interior space images and classify room types and renovation stages.

**CRITICAL:** You MUST respond with complete, valid JSON only. Never truncate or stop mid-response.

**Output Format (COMPLETE JSON REQUIRED):**

{
  "space": {"value": "living_room|kitchen|bedroom|bathroom|entrance|balcony|other", "confidence": 0.95},
  "stage": {"value": "before_renovation|in_progress|finishing_touches|completed", "confidence": 0.90},
  "description": "Room description in Korean (max 100 characters)",
  "keywords": ["design", "style", "feature"]
}

**Guidelines:**
• Always provide complete JSON response
• Focus on interior design and space planning
• Identify room type and renovation progress
• Provide helpful Korean descriptions
• Use positive, design-focused terminology
• NEVER stop response before closing JSON brace"""

        # 모델 초기화 - 단순화
        self.chat_model = genai.GenerativeModel(
            model_name=self.model_name,
            # system_instruction 제거 - 프롬프트에 포함
            safety_settings={
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            }
        )
        
        self.vision_model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=self.vision_prompt,
            safety_settings={
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
        )
        
        # 채팅용 생성 설정 (속도 최적화)
        self.chat_generation_config = genai.types.GenerationConfig(
            temperature=0.2,  # 더 빠른 응답을 위한 낮은 temperature
            top_p=0.7,  # 선택 범위 축소로 속도 향상
            max_output_tokens=500,  # 모바일 최적화, 빠른 응답
            candidate_count=1
        )
        
        # 이미지 분석용 생성 설정 (JSON 강제 - 채팅 아님!)
        self.vision_generation_config = genai.types.GenerationConfig(
            temperature=0.1,
            top_p=0.8, 
            max_output_tokens=2048,  # JSON 응답 잘림 방지
            candidate_count=1
            # response_mime_type="application/json"는 vision_service에서만 사용
        )
        
        self._initialized = True
        logger.info(f"🚀 Unified Gemini Service initialized with {self.model_name}")

    async def chat_response(self, message: str, project_context: Optional[Dict] = None) -> Dict[str, Any]:
        """통합 채팅 응답 생성 - Gemini API 사용"""
        import asyncio
        
        try:
            # 1. 빠른 응답 패턴 체크
            quick_response = await self._check_quick_patterns(message)
            if quick_response:
                return quick_response
            
            # 2. 캐시 확인
            cache = get_cache()
            cached_response = cache.get(message, project_context)
            if cached_response:
                logger.info(f"Cache hit! Age: {cached_response.get('cache_age')}s")
                return cached_response
            
            # 3. Gemini API 호출을 위한 프롬프트 구성
            prompt = self._build_chat_prompt(message, project_context)
            
            logger.info(f"Gemini API 호출 중... 메시지: {message[:50]}")
            
            # Gemini API를 비동기로 호출 (별도 스레드에서)
            response = await asyncio.to_thread(
                self.chat_model.generate_content,
                prompt,
                generation_config=self.chat_generation_config
            )
            
            # 정상 응답 처리 (안전 필터 우회)
            try:
                if response.text:
                    result = {
                        "success": True,
                        "response": response.text,
                        "model": self.model_name,
                        "rag_used": False
                    }
                    # 캐시에 저장
                    cache.set(message, result, project_context)
                    return result
            except Exception as e:
                logger.warning(f"Response blocked or error: {e}")
                pass
            
            # response.text가 없거나 에러인 경우 - 안전 필터 우회
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'content') and candidate.content.parts:
                    # 첫 번째 파트의 텍스트 추출 시도
                    try:
                        text_content = candidate.content.parts[0].text
                        if text_content:
                            return {
                                "success": True,
                                "response": text_content,
                                "model": self.model_name,
                                "rag_used": False
                            }
                    except:
                        pass
            
            # 안전 필터링으로 차단된 경우 PM 비서 응답
            return {
                "success": True,
                "response": "네, 실장님. 해당 내용으로 기록해두겠습니다. 추가로 필요한 사항이 있으시면 말씀해 주세요.",
                "model": self.model_name,
                "rag_used": False
            }
                
        except Exception as e:
            logger.error(f"Chat response error: {e}")
            return {
                "success": False,
                "response": "죄송합니다. 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
                "error": str(e)
            }


    def _is_simple_greeting(self, message: str) -> bool:
        """간단한 인사말 판별"""
        simple_greetings = [
            '하이', '안녕', '안녕하세요', 'hi', 'hello', '헬로', '반가워',
            '좋은 아침', '안녕히', '어이', '여기', '테스트', '테버'
        ]
        msg_lower = message.lower().strip()
        return (
            len(msg_lower) < 20 and 
            any(greeting in msg_lower for greeting in simple_greetings)
        )

    async def _check_quick_patterns(self, message: str) -> Optional[Dict[str, Any]]:
        """빠른 응답 패턴 체크 (캐싱된 응답)"""
        import random
        
        msg_lower = message.lower().strip()
        
        # 1. 간단한 인사말
        if self._is_simple_greeting(message):
            greetings = [
                "안녕하세요 실장님! 오늘 현장은 어떠신가요?",
                "네, 실장님! 무엇을 도와드릴까요?",
                "반갑습니다! TEVOR입니다. 현장 관리를 도와드리겠습니다."
            ]
            return {
                "success": True,
                "response": random.choice(greetings),
                "model": "cache",
                "rag_used": False,
                "quick_response": True
            }
        
        # 2. 감사 표현
        if any(word in msg_lower for word in ['감사', '고마워', '고맙', 'thanks', 'thank']):
            responses = [
                "별말씀을요! 언제든 도와드리겠습니다.",
                "천만에요, 실장님. 더 필요하신 게 있으면 말씀하세요.",
                "도움이 되어 기쁩니다!"
            ]
            return {
                "success": True,
                "response": random.choice(responses),
                "model": "cache",
                "rag_used": False,
                "quick_response": True
            }
        
        # 3. 확인/알겠다 표현
        if any(word in msg_lower for word in ['오케이', 'ok', '알았', '알겠', '네', '응', '그래']):
            if len(msg_lower) < 10:
                return {
                    "success": True,
                    "response": "네, 실장님. 추가로 필요한 사항이 있으면 말씀해주세요.",
                    "model": "cache",
                    "rag_used": False,
                    "quick_response": True
                }
        
        # 4. 긴급 상황
        if any(word in msg_lower for word in ['급해', '빨리', '긴급', '시급', '당장']):
            return {
                "success": True,
                "response": "네, 급한 상황이시군요! 바로 처리하겠습니다. 구체적으로 어떤 도움이 필요하신가요?",
                "model": "cache",
                "rag_used": False,
                "quick_response": True
            }
        
        return None
    
    async def _quick_greeting_response(self) -> Dict[str, Any]:
        """빠른 인사 응답 (레거시 호환)"""
        return await self._check_quick_patterns("안녕하세요")

    def _is_quick_response_pattern(self, message: str) -> bool:
        """빠른 응답이 가능한 패턴 판별 (RAG 스킵)"""
        msg_lower = message.lower().strip()
        msg_len = len(msg_lower)
        
        # 1. 간단한 인사말 (기존 로직)
        simple_greetings = [
            '하이', '안녕', '안녕하세요', 'hi', 'hello', '헬로', '반가워',
            '좋은 아침', '안녕히', '어이', '여기', '테스트'
        ]
        
        if msg_len < 15 and any(greeting in msg_lower for greeting in simple_greetings):
            return True
            
        # 2. 🎨 일반적인 인테리어 상식 질문 (RAG 불필요)
        quick_patterns = [
            '색', '컬러', '추천', '어떤', '뭐가', '좋은', '예쁜', '트렌드',
            '스타일', '분위기', '느낌', '이미지', '감각'
        ]
        
        # 짧고 일반적인 질문들
        if msg_len < 30 and any(pattern in msg_lower for pattern in quick_patterns):
            return True
            
        return False

    async def _generate_quick_response(self, message: str) -> Dict[str, Any]:
        """빠른 응답 생성 (사전 정의된 응답으로 즉시 처리)"""
        
        msg_lower = message.lower().strip()
        
        # 🎨 색상/컬러 관련 질문
        if any(word in msg_lower for word in ['색', '컬러', '색깔', '색상']):
            return {
                "success": True,
                "response": "**거실 색상 추천** 🎨\n\n**2024 트렌드 컬러:**\n• **웜 베이지**: 따뜻하고 안정감 있는 느낌\n• **소프트 그레이**: 모던하고 세련된 분위기\n• **크림 화이트**: 깔끔하고 밝은 공간감\n• **더스티 핑크**: 부드럽고 로맨틱한 감성\n\n**조합 팁:**\n• 메인 컬러 70% + 서브 컬러 20% + 포인트 컬러 10%\n• 자연광이 많은 곳은 차가운 톤, 인공조명이 많은 곳은 따뜻한 톤을 선택하세요",
                "model": self.model_name,
                "rag_used": False,
                "quick_response": True
            }
        
        # 🏠 스타일 관련 질문  
        if any(word in msg_lower for word in ['스타일', '분위기', '느낌', '컨셉']):
            return {
                "success": True,
                "response": "**인테리어 스타일 추천** 🏠\n\n**인기 스타일:**\n• **모던**: 심플하고 깔끔한 라인\n• **스칸디나비안**: 자연소재 + 화이트 톤\n• **미니멀**: 필요한 것만 배치한 여백의 미\n• **인더스트리얼**: 콘크리트 + 철제 소재\n\n**선택 팁:**\n• 생활패턴과 가족구성을 먼저 고려하세요\n• 관리가 쉬운 소재를 우선 선택하세요",
                "model": self.model_name,
                "rag_used": False,
                "quick_response": True
            }
        
        # 💡 조명 관련 질문
        if any(word in msg_lower for word in ['조명', '불', '램프', '라이트']):
            return {
                "success": True,
                "response": "**조명 계획 가이드** 💡\n\n**조명 종류:**\n• **전반 조명**: 천장 LED (기본 밝기)\n• **국부 조명**: 스탠드, 펜던트 (작업용)\n• **장식 조명**: 간접등, 무드등 (분위기)\n\n**배치 팁:**\n• 거실: 3000K-4000K (따뜻한 백색)\n• 주방: 5000K 이상 (차가운 백색)\n• 침실: 2700K (전구색)\n\n조명은 공간의 용도에 맞춰 색온도를 달리하는 것이 핵심입니다!",
                "model": self.model_name,
                "rag_used": False,
                "quick_response": True
            }
        
        # 기본 인사말
        return {
            "success": True,
            "response": "안녕하세요! TEVOR Pro-Assist AI입니다. 🏠\n\n**도움을 드릴 수 있는 분야:**\n• 색상 및 컬러 추천\n• 인테리어 스타일 상담\n• 조명 계획\n• 공간 활용 팁\n\n궁금한 것이 있으시면 언제든 말씀해주세요!",
            "model": self.model_name,
            "rag_used": False,
            "quick_response": True
        }


    def _build_chat_prompt(self, message: str, context: Optional[Dict] = None) -> str:
        """채팅 프롬프트 구성"""
        # 전체 시스템 프롬프트 사용 (안전 필터 우회)
        prompt = f"""{self.chat_prompt}

현재 프로젝트 정보:
- 프로젝트 타입: {context.get('project_type', '일반 주택') if context else '일반 주택'}
- 현재 단계: {context.get('current_stage', '시공 전') if context else '시공 전'}
- 예상 공간: {', '.join(context.get('expected_spaces', ['거실', '주방', '침실', '욕실']) if context else ['거실', '주방', '침실', '욕실'])}

사용자: {message}
TEVOR:"""
        return prompt

    async def _fallback_vision_response(self) -> Dict[str, Any]:
        """이미지 분석 폴백 응답"""
        return {
            "success": False,
            "error": "이미지 분석 응답이 차단되었습니다.",
            "space": {"value": "기타", "confidence": 0.3},
            "stage": {"value": "확인 필요", "confidence": 0.3}
        }

# 싱글톤 인스턴스는 필요할 때 생성
gemini_service = None

def get_gemini_service():
    """Gemini 서비스 인스턴스 가져오기 (lazy initialization)"""
    global gemini_service
    if gemini_service is None:
        gemini_service = UnifiedGeminiService()
    return gemini_service