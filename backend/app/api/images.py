"""
새로운 단순화된 이미지 API
- 분석 + 저장을 한 번에 처리
- 통합 서비스 사용
"""

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import Optional, Dict, Any
import uuid
import io

from app.database import get_db, IS_ASYNC
from app.models.project import Project
from app.services.archive_service import archive_service
from app.utils.file_validation import validate_upload_file

router = APIRouter(prefix="/api/v2/images", tags=["images-v2"])

@router.post("/analyze-and-save")
async def analyze_and_save_image(
    project_id: str = Form(...),
    stage: str = Form(...),  # 사용자가 선택한 시공 단계
    caption: str = Form(""),
    image_file: UploadFile = File(...),
    db = Depends(get_db)
):
    """이미지 분석 + 아카이브 저장을 한 번에 처리"""
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
        
        # 파일 검증
        validation_result = validate_upload_file(image_file)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"파일 검증 실패: {validation_result['error']}"
            )
        
        # 이미지 파일 읽기
        image_data = await image_file.read()
        
        # 이미지 분석은 임시로 비활성화 (Gemini 제거)
        # TODO: GPT-4 Vision API로 교체 필요
        space = "기타"
        confidence = 0.5
        description = caption if caption else "이미지 업로드"
        
        # 아카이브에 저장
        save_result = await archive_service.save_image(
            project_id=project_id,
            image_file=image_data,
            space=space,
            stage=stage,  # 사용자가 선택한 단계 사용
            description=description,
            confidence=confidence
        )
        
        if not save_result.get("success", False):
            raise HTTPException(
                status_code=500,
                detail=f"이미지 저장 실패: {save_result.get('error', 'Unknown error')}"
            )
        
        # 통합 응답
        return {
            "success": True,
            "message": f"이미지가 {space} > {stage} 카테고리로 분석 및 저장되었습니다.",
            "analysis": {
                "space": space,
                "stage": stage,
                "description": description,
                "confidence": confidence,
                "model": "manual"
            },
            "archive": {
                "filename": save_result.get("filename"),
                "archive_url": save_result.get("archive_url"),
                "file_size": save_result.get("file_size"),
                "image_id": save_result.get("image_id")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"이미지 처리 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/archive/{project_id}")
async def get_project_archive(
    project_id: str,
    space: Optional[str] = None,
    stage: Optional[str] = None,
    db = Depends(get_db)
):
    """프로젝트 아카이브 조회"""
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
        
        # 아카이브 조회
        archive_result = await archive_service.get_project_archive(
            project_id=project_id,
            space=space,
            stage=stage
        )
        
        return archive_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"아카이브 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.delete("/archive/{project_id}/{filename}")
async def delete_archived_image(
    project_id: str,
    filename: str,
    db = Depends(get_db)
):
    """아카이브 이미지 삭제"""
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
        
        # 이미지 삭제
        delete_result = await archive_service.delete_image(
            project_id=project_id,
            filename=filename
        )
        
        if not delete_result.get("success", False):
            raise HTTPException(
                status_code=404,
                detail=delete_result.get("message", "파일을 찾을 수 없습니다.")
            )
        
        return delete_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"이미지 삭제 중 오류가 발생했습니다: {str(e)}"
        )