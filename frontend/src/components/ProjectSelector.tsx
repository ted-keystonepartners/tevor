'use client';

import { useState } from 'react';
import { ProjectSelectorProps, ProjectCreate } from '@/lib/types';
import { formatTimestamp } from '@/lib/api';
import { 
  Plus, 
  FolderOpen, 
  Calendar,
  ArrowRight,
  Loader2,
  Search,
  X
} from 'lucide-react';
import clsx from 'clsx';

export default function ProjectSelector({ 
  projects, 
  onSelectProject, 
  onCreateProject, 
  isLoading = false 
}: ProjectSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<ProjectCreate>({
    name: '',
    description: '',
  });

  // 검색 필터링
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  // 프로젝트 생성 폼 제출
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      await onCreateProject(formData.name.trim(), formData.description?.trim());
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
    }
  };

  // 폼 리셋
  const handleCancelCreate = () => {
    setFormData({ name: '', description: '' });
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            TEVOR
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            인테리어 시공 AI 컨시어지
          </p>
          <p className="text-gray-400">
            시공 현장의 모든 기록을 AI와 함께 관리하세요
          </p>
        </div>

        {/* 메인 컨테이너 */}
        <div className="max-w-4xl mx-auto">
          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* 새 프로젝트 생성 버튼 */}
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={isLoading}
              className={clsx(
                'flex items-center justify-center gap-2 px-6 py-4',
                'bg-blue-500 text-white rounded-xl font-medium',
                'hover:bg-blue-600 hover:scale-105',
                'transition-all duration-200 shadow-lg',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
              )}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Plus size={20} />
              )}
              새 프로젝트 시작
            </button>

            {/* 검색 입력 */}
            {projects.length > 0 && (
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="프로젝트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 프로젝트 생성 폼 */}
          {showCreateForm && (
            <div className="mb-8 overflow-hidden transition-all duration-300">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    새 프로젝트 생성
                  </h3>
                  
                  <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        프로젝트명 *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="예: 거실 리노베이션"
                        className="w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                        required
                        autoFocus
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        설명 (선택사항)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                        className="w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={!formData.name.trim() || isLoading}
                        className={clsx(
                          'flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium',
                          'hover:bg-blue-600 transition-colors',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        {isLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                        생성
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleCancelCreate}
                        className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                </div>
            </div>
          )}

          {/* 프로젝트 목록 */}
          <div>
            {filteredProjects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project, index) => (
                  <div
                    key={`${project.project_id}-${index}`}
                    className="transform transition-transform duration-200 hover:scale-105"
                  >
                    <button
                      onClick={() => onSelectProject(project)}
                      className="w-full p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <FolderOpen size={20} className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white line-clamp-1">
                              {project.name}
                            </h3>
                          </div>
                        </div>
                        
                        <ArrowRight 
                          size={16} 
                          className="text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" 
                        />
                      </div>
                      
                      {project.description && (
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={12} />
                        <span>
                          생성일: {formatTimestamp(project.created_at)}
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              // 검색 결과 없음
              <div className="text-center py-12">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-white mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-300 mb-4">
                  '{searchQuery}'와 일치하는 프로젝트가 없습니다.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  검색 초기화
                </button>
              </div>
            ) : (
              // 프로젝트 없음
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  아직 프로젝트가 없습니다
                </h3>
                <p className="text-gray-300 mb-4">
                  첫 번째 프로젝트를 생성하여 TEVOR를 시작해보세요.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  지금 시작하기
                </button>
              </div>
            )}
          </div>

          {/* 로딩 상태 */}
          {isLoading && projects.length === 0 && (
            <div className="text-center py-12">
              <Loader2 size={32} className="mx-auto mb-4 text-blue-400 animate-spin" />
              <p className="text-gray-300">
                프로젝트를 불러오는 중...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}