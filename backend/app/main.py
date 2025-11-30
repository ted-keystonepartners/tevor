import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from app.database import init_db
from app.api import projects, chat, images, chat_stream
# GPT Service 제거됨 - Gemini로 통합

# 환경변수 로드
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작시: 데이터베이스 초기화
    print("🚀 TEVOR Backend 시작 중...")
    print("📊 데이터베이스 초기화...")
    await init_db()
    print("✅ 데이터베이스 초기화 완료")
    
    # 필수 환경변수 확인 (OpenAI API만 사용)
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if not openai_key:
        print("⚠️  경고: OPENAI_API_KEY가 설정되지 않았습니다!")
        print("   채팅 기능이 작동하지 않습니다.")
        print("💡 .env 파일을 생성하고 OpenAI API 키를 설정해주세요")
    else:
        print("✅ OpenAI API Key 확인됨")
        
        # API 키 유효성 간단 검증
        if len(openai_key.strip()) < 20:
            print("⚠️ OpenAI API 키가 너무 짧습니다. 유효하지 않을 수 있습니다.")
        elif not openai_key.startswith("sk-"):
            print("⚠️ OpenAI API 키 형식이 올바르지 않을 수 있습니다.")
    
    # 스토리지 폴더 생성
    storage_path = os.getenv("STORAGE_PATH", "storage/projects")
    os.makedirs(storage_path, exist_ok=True)
    os.makedirs("db", exist_ok=True)
    
    print(f"📁 스토리지 경로: {os.path.abspath(storage_path)}")
    print("🎯 TEVOR Backend 준비 완료!")
    print("🌐 서버 주소: http://localhost:8000")
    print("📖 API 문서: http://localhost:8000/docs")
    
    yield
    
    # 서버 종료시
    print("🛑 TEVOR Backend 종료 중...")

# FastAPI 앱 생성
app = FastAPI(
    title="TEVOR API",
    description="인테리어 시공 AI 컨시어지 백엔드 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정 (프로덕션 지원)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://tevor.vercel.app",  # Vercel 기본 도메인
        "https://tevor-*.vercel.app",  # Vercel 프리뷰 도메인
        "https://*.vercel.app",  # 모든 Vercel 도메인 (개발 중)
        # 커스텀 도메인 추가 시 여기에 추가
    ],
    allow_credentials=True,  # 쿠키/인증 지원
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # OPTIONS 추가
    allow_headers=[
        "Content-Type", 
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With"
    ],
)

# 정적 파일 서빙 설정 (아카이브 이미지)
archive_path = "archive"
if os.path.exists(archive_path):
    app.mount("/archive", StaticFiles(directory=archive_path), name="archive")

# 정적 파일 서빙 설정 (스토리지 이미지 - temp 및 일반 파일)
storage_base_path = "storage"  # storage 전체 디렉토리를 서빙
if os.path.exists(storage_base_path):
    app.mount("/storage", StaticFiles(directory=storage_base_path), name="storage")

# 정적 파일 서빙 설정 (채팅 이미지)
static_images_path = "static/images"
os.makedirs(static_images_path, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# API 라우터 등록
app.include_router(projects.router)
app.include_router(chat.router)
app.include_router(chat_stream.router)  # 스트리밍 채팅 라우터 추가
app.include_router(images.router)

# API 라우터 (리팩토링 완료)

# 헬스체크 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "TEVOR API",
        "version": "1.0.0",
        "status": "healthy",
        "message": "인테리어 시공 AI 컨시어지 백엔드가 정상적으로 작동 중입니다.",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    try:
        # 기본 상태 체크
        health_status = {
            "status": "healthy",
            "database": "ok",
            "storage": "ok",
            "ai_service": "unknown"
        }
        
        # 스토리지 폴더 체크
        storage_path = os.getenv("STORAGE_PATH", "storage/projects")
        if not os.path.exists(storage_path):
            health_status["storage"] = "error"
            health_status["status"] = "degraded"
        
        # OpenAI API 키 체크
        openai_key = os.getenv("OPENAI_API_KEY")
        
        if openai_key:
            health_status["ai_service"] = "configured"
        else:
            health_status["ai_service"] = "not_configured"
            health_status["status"] = "degraded"
        
        return health_status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# 환경 정보 엔드포인트 (개발용)
@app.get("/env-info")
async def env_info():
    openai_configured = bool(os.getenv("OPENAI_API_KEY"))
    
    return {
        "storage_path": os.path.abspath(os.getenv("STORAGE_PATH", "storage/projects")),
        "database_url": os.getenv("DATABASE_URL", "sqlite:///db/tevor.db"),
        "openai_configured": openai_configured,
        "ai_service": "OpenAI GPT" if openai_configured else "Not configured",
        "python_version": os.sys.version,
        "working_directory": os.getcwd()
    }

# 캐시 통계 엔드포인트 (성능 모니터링용)
@app.get("/cache-stats")
async def cache_stats():
    return {
        "service": "TEVOR Cache Statistics",
        "timestamp": time.time(),
        "gemini_service": "active",
        "archive_service": "active",
        "status": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )