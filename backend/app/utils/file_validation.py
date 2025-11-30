"""
파일 업로드 보안 검증 유틸리티
기존 코드에 영향을 주지 않으면서 안전한 파일 업로드를 보장합니다.
"""
import os
from pathlib import Path
from typing import Set, Optional
from fastapi import HTTPException, UploadFile

# python-magic을 옵셔널로 설정 (시스템 호환성을 위해)
try:
    import magic
    HAS_MAGIC = True
except ImportError:
    magic = None
    HAS_MAGIC = False

# 허용된 이미지 확장자
ALLOWED_IMAGE_EXTENSIONS: Set[str] = {
    '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'
}

# 허용된 MIME 타입
ALLOWED_MIME_TYPES: Set[str] = {
    'image/jpeg', 'image/png', 'image/webp', 
    'image/bmp', 'image/tiff'
}

# 최대 파일 크기 (10MB)
MAX_FILE_SIZE: int = 10 * 1024 * 1024

# 최소 파일 크기 (1KB)
MIN_FILE_SIZE: int = 1024


def validate_file_extension(filename: str) -> bool:
    """파일 확장자 검증"""
    if not filename:
        return False
    
    file_ext = Path(filename).suffix.lower()
    return file_ext in ALLOWED_IMAGE_EXTENSIONS


def validate_file_size(file_size: int) -> bool:
    """파일 크기 검증"""
    return MIN_FILE_SIZE <= file_size <= MAX_FILE_SIZE


def validate_mime_type(content_type: Optional[str]) -> bool:
    """MIME 타입 검증"""
    if not content_type:
        return False
    return content_type.lower() in ALLOWED_MIME_TYPES


def detect_file_type(file_content: bytes) -> Optional[str]:
    """파일 내용으로부터 실제 파일 타입 감지"""
    try:
        # python-magic이 설치되어 있으면 사용
        if HAS_MAGIC and magic and hasattr(magic, 'from_buffer'):
            mime_type = magic.from_buffer(file_content, mime=True)
            return mime_type
    except:
        pass
    
    # 간단한 파일 시그니처 검사
    if file_content.startswith(b'\xff\xd8\xff'):
        return 'image/jpeg'
    elif file_content.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'image/png'
    elif file_content.startswith(b'RIFF') and b'WEBP' in file_content[:12]:
        return 'image/webp'
    elif file_content.startswith(b'BM'):
        return 'image/bmp'
    
    return None


def validate_upload_file(file: UploadFile) -> dict:
    """
    업로드 파일에 대한 종합적인 보안 검증
    
    Args:
        file: FastAPI UploadFile 객체
        
    Returns:
        dict: 검증 결과
        {
            "valid": bool,
            "error_code": str,
            "error_message": str,
            "file_info": dict
        }
    
    Raises:
        HTTPException: 검증 실패 시
    """
    try:
        # 1. 파일명 검증
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="파일명이 없습니다."
            )
        
        # 2. 확장자 검증
        if not validate_file_extension(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"지원하지 않는 파일 형식입니다. 허용된 형식: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
            )
        
        # 3. MIME 타입 검증
        if not validate_mime_type(file.content_type):
            raise HTTPException(
                status_code=400,
                detail=f"지원하지 않는 파일 타입입니다. 허용된 타입: {', '.join(ALLOWED_MIME_TYPES)}"
            )
        
        # 4. 파일 내용 읽기 및 크기 검증
        file_content = file.file.read()
        file.file.seek(0)  # 포인터를 처음으로 되돌림
        
        if not validate_file_size(len(file_content)):
            raise HTTPException(
                status_code=400,
                detail=f"파일 크기는 {MIN_FILE_SIZE//1024}KB ~ {MAX_FILE_SIZE//1024//1024}MB 사이여야 합니다."
            )
        
        # 5. 파일 시그니처 검증 (실제 파일 타입 확인)
        detected_mime = detect_file_type(file_content)
        if not detected_mime or detected_mime not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail="파일 내용이 이미지 파일이 아닙니다."
            )
        
        # 6. MIME 타입 일치 검증 (spoofing 방지)
        if detected_mime != file.content_type:
            # 일부 브라우저에서 MIME 타입이 다를 수 있으므로 경고만 출력
            print(f"Warning: MIME type mismatch - declared: {file.content_type}, detected: {detected_mime}")
        
        return {
            "valid": True,
            "error_code": None,
            "error_message": None,
            "file_info": {
                "filename": file.filename,
                "declared_mime_type": file.content_type,
                "detected_mime_type": detected_mime,
                "file_size": len(file_content),
                "file_extension": Path(file.filename).suffix.lower()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"파일 검증 중 오류가 발생했습니다: {str(e)}"
        )


def validate_filename_security(filename: str) -> str:
    """
    파일명 보안 검증 및 정리
    
    Args:
        filename: 원본 파일명
        
    Returns:
        str: 안전한 파일명
    """
    # 위험한 문자 제거
    safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.()[]"
    safe_filename = "".join(c for c in filename if c in safe_chars)
    
    # 빈 파일명 방지
    if not safe_filename:
        safe_filename = f"image_{os.urandom(4).hex()}"
    
    # 파일명 길이 제한 (확장자 포함 255자)
    if len(safe_filename) > 255:
        name_part = Path(safe_filename).stem[:240]  # 확장자를 위한 여유 공간
        ext_part = Path(safe_filename).suffix
        safe_filename = f"{name_part}{ext_part}"
    
    # 시스템 예약어 방지 (Windows)
    reserved_names = {'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 
                     'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 
                     'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'}
    
    name_without_ext = Path(safe_filename).stem.upper()
    if name_without_ext in reserved_names:
        safe_filename = f"file_{safe_filename}"
    
    return safe_filename


# 보안 검증을 위한 데코레이터
def secure_file_upload(func):
    """파일 업로드 함수에 보안 검증을 추가하는 데코레이터"""
    async def wrapper(file: UploadFile, *args, **kwargs):
        # 파일 검증 수행
        validation_result = validate_upload_file(file)
        
        # 검증 통과 시 원본 함수 실행
        return await func(file, *args, **kwargs)
    
    return wrapper