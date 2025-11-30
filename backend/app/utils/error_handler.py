"""
표준화된 에러 응답 처리 유틸리티
일관된 에러 응답 구조와 코드를 제공합니다.
"""
import time
import uuid
from typing import Optional, Dict, Any
from fastapi import HTTPException
from enum import Enum

class ErrorCode(str, Enum):
    """표준 에러 코드"""
    # 일반적인 HTTP 에러
    NOT_FOUND = "NOT_FOUND"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    
    # 비즈니스 로직 에러
    PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND"
    MESSAGE_NOT_FOUND = "MESSAGE_NOT_FOUND"
    IMAGE_NOT_FOUND = "IMAGE_NOT_FOUND"
    
    # 파일 관련 에러
    FILE_VALIDATION_ERROR = "FILE_VALIDATION_ERROR"
    FILE_STORAGE_ERROR = "FILE_STORAGE_ERROR"
    FILE_SIZE_ERROR = "FILE_SIZE_ERROR"
    UNSUPPORTED_FILE_TYPE = "UNSUPPORTED_FILE_TYPE"
    
    # AI 서비스 에러
    AI_SERVICE_ERROR = "AI_SERVICE_ERROR"
    VISION_ANALYSIS_ERROR = "VISION_ANALYSIS_ERROR"
    GPT_SERVICE_ERROR = "GPT_SERVICE_ERROR"
    
    # 시스템 에러
    DATABASE_ERROR = "DATABASE_ERROR"
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"

class StandardError:
    """표준화된 에러 응답 구조"""
    
    @staticmethod
    def create_error_response(
        error_code: ErrorCode,
        user_message: str,
        developer_message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """표준 에러 응답 생성"""
        error_response = {
            "error": True,
            "error_code": error_code.value,
            "message": user_message,
            "timestamp": time.time(),
            "request_id": str(uuid.uuid4())[:8]
        }
        
        if developer_message:
            error_response["developer_message"] = developer_message
            
        if details:
            error_response["details"] = details
            
        return error_response

class TevrorHTTPException(HTTPException):
    """TEVOR 표준 HTTP Exception"""
    
    def __init__(
        self,
        status_code: int,
        error_code: ErrorCode,
        user_message: str,
        developer_message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        error_response = StandardError.create_error_response(
            error_code=error_code,
            user_message=user_message,
            developer_message=developer_message,
            details=details
        )
        
        super().__init__(status_code=status_code, detail=error_response)

# 편의 함수들
def not_found_error(
    resource: str = "리소스",
    resource_id: Optional[str] = None,
    developer_message: Optional[str] = None
) -> TevrorHTTPException:
    """404 에러 생성"""
    message = f"{resource}를 찾을 수 없습니다"
    if resource_id:
        message += f" (ID: {resource_id})"
    
    details = {"resource": resource}
    if resource_id:
        details["resource_id"] = resource_id
    
    return TevrorHTTPException(
        status_code=404,
        error_code=ErrorCode.NOT_FOUND,
        user_message=message,
        developer_message=developer_message,
        details=details
    )

def validation_error(
    field: str,
    message: str,
    developer_message: Optional[str] = None,
    validation_details: Optional[Dict[str, Any]] = None
) -> TevrorHTTPException:
    """400 유효성 검사 에러 생성"""
    details = {"field": field}
    if validation_details:
        details.update(validation_details)
    
    return TevrorHTTPException(
        status_code=400,
        error_code=ErrorCode.VALIDATION_ERROR,
        user_message=message,
        developer_message=developer_message,
        details=details
    )

def file_validation_error(
    message: str,
    file_info: Optional[Dict[str, Any]] = None,
    developer_message: Optional[str] = None
) -> TevrorHTTPException:
    """파일 유효성 검사 에러 생성"""
    return TevrorHTTPException(
        status_code=400,
        error_code=ErrorCode.FILE_VALIDATION_ERROR,
        user_message=message,
        developer_message=developer_message,
        details=file_info or {}
    )

def ai_service_error(
    service: str = "AI 서비스",
    user_message: str = "AI 서비스에 일시적인 문제가 있습니다",
    developer_message: Optional[str] = None
) -> TevrorHTTPException:
    """AI 서비스 에러 생성"""
    return TevrorHTTPException(
        status_code=500,
        error_code=ErrorCode.AI_SERVICE_ERROR,
        user_message=user_message,
        developer_message=developer_message,
        details={"service": service}
    )

def database_error(
    operation: str,
    developer_message: Optional[str] = None
) -> TevrorHTTPException:
    """데이터베이스 에러 생성"""
    return TevrorHTTPException(
        status_code=500,
        error_code=ErrorCode.DATABASE_ERROR,
        user_message="데이터베이스 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        developer_message=developer_message,
        details={"operation": operation}
    )

def internal_server_error(
    operation: str = "서버 작업",
    developer_message: Optional[str] = None
) -> TevrorHTTPException:
    """내부 서버 에러 생성"""
    return TevrorHTTPException(
        status_code=500,
        error_code=ErrorCode.INTERNAL_SERVER_ERROR,
        user_message="내부 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        developer_message=developer_message,
        details={"operation": operation}
    )

# 특화된 에러 함수들
def project_not_found_error(project_id: str) -> TevrorHTTPException:
    """프로젝트를 찾을 수 없음"""
    return not_found_error(
        resource="프로젝트",
        resource_id=project_id,
        developer_message=f"Project with ID '{project_id}' does not exist"
    )

def message_not_found_error(message_id: str) -> TevrorHTTPException:
    """메시지를 찾을 수 없음"""
    return not_found_error(
        resource="메시지",
        resource_id=message_id,
        developer_message=f"Message with ID '{message_id}' does not exist"
    )

def image_not_found_error(image_id: str) -> TevrorHTTPException:
    """이미지를 찾을 수 없음"""
    return not_found_error(
        resource="이미지",
        resource_id=image_id,
        developer_message=f"Image with ID '{image_id}' does not exist"
    )