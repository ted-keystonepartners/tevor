"""
TEVOR Archive Service
- 이미지 저장 및 관리
- 프로젝트별 아카이브 조회
- 파일 시스템 관리
"""

import os
import uuid
import shutil
from datetime import datetime
from typing import Dict, List, Optional, Any
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)

class ArchiveService:
    def __init__(self):
        self.base_storage_path = os.getenv("STORAGE_PATH", "storage/projects")
        self.archive_path = "archive"
        
        # 디렉토리 생성
        os.makedirs(self.base_storage_path, exist_ok=True)
        os.makedirs(self.archive_path, exist_ok=True)

    async def save_image(
        self, 
        project_id: str,
        image_file: bytes,
        space: str,
        stage: str,
        description: str = "",
        confidence: float = 0.8
    ) -> Dict[str, Any]:
        """이미지를 아카이브에 저장"""
        try:
            # 파일명 생성: {space}_{stage}_{timestamp}_{uuid}.png
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            image_id = str(uuid.uuid4())[:8]
            filename = f"{space}_{stage}_{timestamp}_{image_id}.png"
            
            # 프로젝트별 아카이브 경로
            project_archive_path = os.path.join(self.archive_path, project_id)
            os.makedirs(project_archive_path, exist_ok=True)
            
            # 이미지 저장
            file_path = os.path.join(project_archive_path, filename)
            
            # PIL로 이미지 최적화 저장
            image = Image.open(io.BytesIO(image_file))
            
            # 이미지 크기 최적화 (최대 1920x1080)
            if image.width > 1920 or image.height > 1080:
                image.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
            
            # PNG로 저장 (품질 유지)
            image.save(file_path, "PNG", optimize=True)
            
            # 메타데이터 생성
            metadata = {
                "image_id": f"img_{image_id}",
                "project_id": project_id,
                "filename": filename,
                "file_path": file_path,
                "space": space,
                "stage": stage,
                "description": description,
                "confidence": confidence,
                "file_size": os.path.getsize(file_path),
                "created_at": datetime.now().isoformat(),
                "archive_url": f"/archive/{project_id}/{filename}"
            }
            
            logger.info(f"📁 Image archived: {filename} for project {project_id}")
            
            return {
                "success": True,
                "message": f"이미지가 {space} > {stage} 카테고리로 저장되었습니다.",
                **metadata
            }
            
        except Exception as e:
            logger.error(f"Archive save error: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "이미지 저장 중 오류가 발생했습니다."
            }

    async def get_project_archive(
        self, 
        project_id: str, 
        space: Optional[str] = None,
        stage: Optional[str] = None
    ) -> Dict[str, Any]:
        """프로젝트 아카이브 조회"""
        try:
            project_archive_path = os.path.join(self.archive_path, project_id)
            
            if not os.path.exists(project_archive_path):
                return {
                    "success": True,
                    "project_id": project_id,
                    "archived_images": [],
                    "summary": {
                        "total_images": 0,
                        "spaces": {},
                        "stages": {}
                    }
                }
            
            # 파일 목록 수집
            archived_images = []
            space_counts = {}
            stage_counts = {}
            
            for filename in os.listdir(project_archive_path):
                if not filename.endswith('.png'):
                    continue
                    
                # 파일명 파싱: {space}_{stage}_{timestamp}_{uuid}.png
                try:
                    parts = filename.replace('.png', '').split('_')
                    if len(parts) >= 4:
                        file_space = parts[0]
                        file_stage = parts[1]
                        file_timestamp = f"{parts[2]}_{parts[3]}"
                        
                        # 필터링
                        if space and file_space != space:
                            continue
                        if stage and file_stage != stage:
                            continue
                        
                        # 파일 정보
                        file_path = os.path.join(project_archive_path, filename)
                        file_stat = os.stat(file_path)
                        
                        image_info = {
                            "filename": filename,
                            "space": file_space,
                            "stage": file_stage,
                            "timestamp": file_timestamp,
                            "file_size": file_stat.st_size,
                            "created_at": datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
                            "archive_url": f"/archive/{project_id}/{filename}"
                        }
                        
                        archived_images.append(image_info)
                        
                        # 통계 집계
                        space_counts[file_space] = space_counts.get(file_space, 0) + 1
                        stage_counts[file_stage] = stage_counts.get(file_stage, 0) + 1
                        
                except (IndexError, ValueError) as e:
                    logger.warning(f"Invalid filename format: {filename}")
                    continue
            
            # 최신순 정렬
            archived_images.sort(key=lambda x: x['created_at'], reverse=True)
            
            return {
                "success": True,
                "project_id": project_id,
                "archived_images": archived_images,
                "summary": {
                    "total_images": len(archived_images),
                    "spaces": space_counts,
                    "stages": stage_counts,
                    "latest_archive": archived_images[0] if archived_images else None
                }
            }
            
        except Exception as e:
            logger.error(f"Archive retrieve error: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "아카이브 조회 중 오류가 발생했습니다."
            }

    async def delete_image(
        self, 
        project_id: str,
        filename: str
    ) -> Dict[str, Any]:
        """아카이브 이미지 삭제"""
        try:
            project_archive_path = os.path.join(self.archive_path, project_id)
            file_path = os.path.join(project_archive_path, filename)
            
            if not os.path.exists(file_path):
                return {
                    "success": False,
                    "message": f"파일을 찾을 수 없습니다: {filename}"
                }
            
            # 파일 삭제
            os.remove(file_path)
            
            logger.info(f"🗑️ Image deleted: {filename} from project {project_id}")
            
            return {
                "success": True,
                "message": f"이미지가 성공적으로 삭제되었습니다: {filename}"
            }
            
        except Exception as e:
            logger.error(f"Archive delete error: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "이미지 삭제 중 오류가 발생했습니다."
            }

    def generate_metadata(
        self, 
        project_id: str,
        space_data: Dict,
        stage_candidates: List,
        selected_stage: str,
        original_filename: str,
        description: str = ""
    ) -> Dict[str, Any]:
        """이미지 메타데이터 생성"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            image_id = str(uuid.uuid4())[:8]
            filename = f"{space_data['value']}_{selected_stage}_{timestamp}_{image_id}.png"
            
            return {
                "image_id": f"arch_{image_id}",
                "project_id": project_id,
                "filename": filename,
                "space": space_data,
                "selected_stage": selected_stage,
                "stage_candidates": stage_candidates,
                "original_filename": original_filename,
                "description": description,
                "timestamp": timestamp,
                "created_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Generate metadata error: {e}")
            return {
                "error": str(e)
            }

    def save_image_to_archive(self, image_bytes: bytes, metadata: Dict) -> Dict[str, Any]:
        """메타데이터를 기반으로 이미지를 아카이브에 저장"""
        try:
            # 프로젝트별 아카이브 경로
            project_archive_path = os.path.join(self.archive_path, metadata["project_id"])
            os.makedirs(project_archive_path, exist_ok=True)
            
            # 이미지 저장
            file_path = os.path.join(project_archive_path, metadata["filename"])
            
            # PIL로 이미지 최적화 저장
            image = Image.open(io.BytesIO(image_bytes))
            
            # 이미지 크기 최적화 (최대 1920x1080)
            if image.width > 1920 or image.height > 1080:
                image.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
            
            # PNG로 저장 (품질 유지)
            image.save(file_path, "PNG", optimize=True)
            
            logger.info(f"📁 Image archived: {metadata['filename']} for project {metadata['project_id']}")
            
            return {
                "success": True,
                "archive_id": metadata["image_id"],
                "filename": metadata["filename"],
                "archive_path": file_path,
                "message": f"이미지가 성공적으로 저장되었습니다."
            }
            
        except Exception as e:
            logger.error(f"Save to archive error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def get_archived_images(
        self, 
        project_id: str, 
        space: Optional[str] = None,
        stage: Optional[str] = None
    ) -> List[Dict]:
        """아카이브된 이미지 목록 조회"""
        try:
            project_archive_path = os.path.join(self.archive_path, project_id)
            
            if not os.path.exists(project_archive_path):
                return []
            
            archived_images = []
            
            for filename in os.listdir(project_archive_path):
                if not filename.endswith('.png'):
                    continue
                    
                # 파일명 파싱: {space}_{stage}_{timestamp}_{uuid}.png
                try:
                    parts = filename.replace('.png', '').split('_')
                    if len(parts) >= 4:
                        file_space = parts[0]
                        file_stage = parts[1]
                        
                        # 필터링
                        if space and file_space != space:
                            continue
                        if stage and file_stage != stage:
                            continue
                        
                        # 파일 정보
                        file_path = os.path.join(project_archive_path, filename)
                        file_stat = os.stat(file_path)
                        
                        image_info = {
                            "filename": filename,
                            "space": file_space,
                            "stage": file_stage,
                            "file_size": file_stat.st_size,
                            "created_at": datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
                            "archive_url": f"/archive/{project_id}/{filename}"
                        }
                        
                        archived_images.append(image_info)
                        
                except (IndexError, ValueError):
                    logger.warning(f"Invalid filename format: {filename}")
                    continue
            
            # 최신순 정렬
            archived_images.sort(key=lambda x: x['created_at'], reverse=True)
            return archived_images
            
        except Exception as e:
            logger.error(f"Get archived images error: {e}")
            return []

    def get_archive_summary(self, project_id: str) -> Dict[str, Any]:
        """아카이브 요약 정보"""
        try:
            archived_images = self.get_archived_images(project_id)
            
            space_counts = {}
            stage_counts = {}
            
            for img in archived_images:
                space = img.get("space", "기타")
                stage = img.get("stage", "기타")
                
                space_counts[space] = space_counts.get(space, 0) + 1
                stage_counts[stage] = stage_counts.get(stage, 0) + 1
            
            return {
                "total_images": len(archived_images),
                "spaces": space_counts,
                "stages": stage_counts,
                "latest_archive": archived_images[0] if archived_images else None
            }
            
        except Exception as e:
            logger.error(f"Archive summary error: {e}")
            return {
                "total_images": 0,
                "spaces": {},
                "stages": {},
                "latest_archive": None
            }

    def get_storage_info(self) -> Dict[str, Any]:
        """스토리지 정보 조회"""
        try:
            total_size = 0
            total_files = 0
            
            for root, dirs, files in os.walk(self.archive_path):
                for file in files:
                    if file.endswith('.png'):
                        file_path = os.path.join(root, file)
                        total_size += os.path.getsize(file_path)
                        total_files += 1
            
            return {
                "total_files": total_files,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "archive_path": os.path.abspath(self.archive_path)
            }
            
        except Exception as e:
            logger.error(f"Storage info error: {e}")
            return {
                "error": str(e)
            }

# 싱글톤 인스턴스
archive_service = ArchiveService()