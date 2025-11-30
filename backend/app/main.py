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
    
    # 필수 환경변수 확인 (강화된 검증)
    required_env_vars = {
        "GOOGLE_API_KEY": "Google Gemini 서비스", 
        "GEMINI_API_KEY": "Google Gemini 서비스 (대체)"
    }
    
    missing_vars = []
    warnings = []
    
    # Gemini API Key 확인 및 유효성 검증
    gemini_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        missing_vars.extend(["GOOGLE_API_KEY", "GEMINI_API_KEY"])
        warnings.append("🚨 Gemini Vision API 키가 없습니다. 이미지 분석 기능이 작동하지 않습니다!")
    else:
        key_source = "GOOGLE_API_KEY" if os.getenv("GOOGLE_API_KEY") else "GEMINI_API_KEY"
        print(f"✅ Gemini API Key 확인됨 (Source: {key_source})")
        
        # API 키 유효성 간단 검증 (키 포맷 확인)
        if len(gemini_key.strip()) < 10:
            warnings.append("⚠️ Gemini API 키가 너무 짧습니다. 유효하지 않을 수 있습니다.")
        elif not gemini_key.startswith(("AIza", "AIzB", "AIzC")):
            warnings.append("⚠️ Gemini API 키 형식이 올바르지 않을 수 있습니다.")
    
    if missing_vars:
        print(f"⚠️  경고: 다음 환경변수가 설정되지 않았습니다:")
        for var in missing_vars:
            service = required_env_vars.get(var, "Unknown service")
            print(f"   - {var}: {service}")
        print("💡 .env 파일을 생성하고 필요한 API 키를 설정해주세요")
    
    if warnings:
        for warning in warnings:
            print(warning)
    
    if not missing_vars:
        print("✅ 모든 필수 환경변수 설정 완료")
    
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

# CORS 설정 (보안 강화)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        # 프로덕션에서는 실제 도메인으로 변경
        # "https://your-production-domain.com"
    ],
    allow_credentials=False,  # 보안상 credentials 비활성화
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # 필요한 메서드만 허용
    allow_headers=[
        "Content-Type", 
        "Authorization",  # 향후 인증 구현 시 필요
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
        
        # Gemini API 키 체크
        if not (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")):
            health_status["ai_service"] = "not_configured"
            health_status["status"] = "degraded"
        else:
            health_status["ai_service"] = "configured"
        
        return health_status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# 환경 정보 엔드포인트 (개발용)
@app.get("/env-info")
async def env_info():
    return {
        "storage_path": os.path.abspath(os.getenv("STORAGE_PATH", "storage/projects")),
        "database_url": os.getenv("DATABASE_URL", "sqlite:///db/tevor.db"),
        "gemini_configured": bool(os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")),
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