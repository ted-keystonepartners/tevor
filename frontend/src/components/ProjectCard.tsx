'use client';

import { Calendar, MapPin, Image, Folder } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // description에서 정보 파싱
  let parsedInfo = { address: '', source: '', note: '' };
  try {
    if (project.description && project.description.startsWith('{')) {
      parsedInfo = JSON.parse(project.description);
    }
  } catch (e) {
    // JSON 파싱 실패 시 기본값 유지
  }

  const address = parsedInfo.address || project.address || '';
  const source = parsedInfo.source || project.source || '';
  const note = parsedInfo.note || '';
  const fileCount = project.file_count || 0;
  const photoCount = project.photo_count || 0;

  // 프로젝트 생성일로부터 경과일 계산
  const createdDate = new Date(project.created_at);
  const today = new Date();
  const daysPassed = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      onClick={onSelect}
      className="group relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer border border-gray-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]"
    >
      
      {/* 카드 컨텐츠 */}
      <div className="p-6">
        {/* 헤더 영역 */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-white line-clamp-1">
              {project.name}
            </h3>
            {source && (
              <span className="text-xs px-2 py-1 bg-gray-900 text-gray-400 rounded-md">
                {source}
              </span>
            )}
          </div>
          
          {/* 주소 */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin size={14} className="flex-shrink-0" />
            <p className="truncate">{address || '주소 미등록'}</p>
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="space-y-3 pt-4 border-t border-gray-700">
          {/* 생성일 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar size={14} />
              <span>시작일</span>
            </div>
            <span className="text-gray-300 font-medium">
              {formatDate(project.created_at)}
            </span>
          </div>

          {/* 진행 일수 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">진행 기간</span>
            <span className="text-gray-300 font-medium">
              {daysPassed === 0 ? '오늘 시작' : `${daysPassed}일째`}
            </span>
          </div>

        </div>

        {/* 파일 및 사진 수 */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Folder size={14} className="text-gray-500" />
              <span className="text-gray-400">파일 {fileCount}개</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Image size={14} className="text-gray-500" />
              <span className="text-gray-400">사진 {photoCount}개</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}