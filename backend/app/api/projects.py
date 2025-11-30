from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import uuid
from datetime import datetime

from app.database import get_db
from app.models.project import Project
from app.schemas.chat import ProjectCreate, ProjectResponse
from app.services.archive_service import ArchiveService

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 고유한 프로젝트 ID 생성
        project_id = f"proj_{uuid.uuid4().hex[:8]}"
        
        # 데이터베이스에 프로젝트 저장
        new_project = Project(
            project_id=project_id,
            name=project_data.name,
            description=project_data.description
        )
        
        db.add(new_project)
        await db.commit()
        await db.refresh(new_project)
        
# 스토리지는 필요시에만 생성하도록 단순화
        
        return ProjectResponse(
            project_id=new_project.project_id,
            name=new_project.name,
            description=new_project.description,
            created_at=new_project.created_at
        )
        
    except Exception as e:
        await db.rollback()
        print(f"Project creation error: {e}")
        raise HTTPException(status_code=500, detail=f"프로젝트 생성 실패: {str(e)}")

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            select(Project).where(Project.project_id == project_id)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
        
        return ProjectResponse(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            created_at=project.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Project retrieval error: {e}")
        raise HTTPException(status_code=500, detail=f"프로젝트 조회 실패: {str(e)}")

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            select(Project)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        projects = result.scalars().all()
        
        return [
            ProjectResponse(
                project_id=project.project_id,
                name=project.name,
                description=project.description,
                created_at=project.created_at
            )
            for project in projects
        ]
        
    except Exception as e:
        print(f"Projects listing error: {e}")
        raise HTTPException(status_code=500, detail=f"프로젝트 목록 조회 실패: {str(e)}")

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 프로젝트 존재 확인
        result = await db.execute(
            select(Project).where(Project.project_id == project_id)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
        
        # 데이터베이스에서 삭제
        await db.delete(project)
        await db.commit()
        
        # 스토리지에서 폴더 삭제는 추후 구현 (안전을 위해 수동 삭제 권장)
        
        return {"message": "프로젝트가 삭제되었습니다", "project_id": project_id}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print(f"Project deletion error: {e}")
        raise HTTPException(status_code=500, detail=f"프로젝트 삭제 실패: {str(e)}")

@router.get("/{project_id}/summary")
async def get_project_summary(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 프로젝트 존재 확인
        result = await db.execute(
            select(Project).where(Project.project_id == project_id)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
        
        # 메타데이터는 데이터베이스에서 직접 조회하도록 단순화
        metadata = {"images": [], "total_images": 0, "images_by_type": {}}
        
        return {
            "project_info": {
                "project_id": project.project_id,
                "name": project.name,
                "description": project.description,
                "created_at": project.created_at
            },
            "statistics": {
                "total_images": metadata.get("total_images", 0),
                "images_by_type": metadata.get("images_by_type", {}),
                "last_updated": metadata.get("updated_at")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Project summary error: {e}")
        raise HTTPException(status_code=500, detail=f"프로젝트 요약 조회 실패: {str(e)}")

@router.get("/{project_id}/archive")
async def get_project_archive(
    project_id: str,
    space: Optional[str] = Query(None, description="공간 필터"),
    stage: Optional[str] = Query(None, description="단계 필터"),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 프로젝트 존재 확인
        result = await db.execute(
            select(Project).where(Project.project_id == project_id)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
        
        # 아카이브 서비스 초기화
        archive_service = ArchiveService()
        
        # 아카이브된 이미지 조회
        archived_images = archive_service.get_archived_images(
            project_id=project_id,
            space=space,
            stage=stage
        )
        
        # 경로를 HTTP 접근 가능한 형태로 변환
        for image in archived_images:
            if image.get("image_exists") and image.get("archive_path") and image.get("filename"):
                # /archive/{archive_path}/{filename} 형태로 변환
                http_path = f"/archive/{image['archive_path']}/{image['filename']}"
                image["full_image_path"] = http_path
        
        # 요약 통계 조회
        summary = archive_service.get_archive_summary(project_id)
        
        return {
            "success": True,
            "project_id": project_id,
            "archived_images": archived_images,
            "summary": summary,
            "filters": {
                "space": space,
                "stage": stage
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Archive retrieval error: {e}")
        raise HTTPException(status_code=500, detail=f"아카이브 조회 실패: {str(e)}")