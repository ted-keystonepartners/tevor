'use client';

import { useEffect, useState, useRef } from 'react';
import { useProject } from '@/hooks/useProject';
import { useError, useUIActions } from '@/lib/store';
import { Plus, Search, X, ChevronDown, Home, FolderOpen, Images, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProjectCard from '@/components/ProjectCard';
import TypewriterText from '@/components/TypewriterText';

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAddress, setNewProjectAddress] = useState('');
  const [newProjectSource, setNewProjectSource] = useState('');
  const [newProjectNote, setNewProjectNote] = useState('');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showSecondGreeting, setShowSecondGreeting] = useState(false);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    projects,
    loading,
    createAndSelectProject,
    selectProject,
  } = useProject();
  
  const error = useError();
  const { clearError } = useUIActions();

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
        setShowSourceDropdown(false);
      }
    };

    if (showSourceDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSourceDropdown]);

  // 프로젝트 필터링
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 프로젝트 생성 핸들러
  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectAddress.trim()) return;
    
    // description에 모든 정보를 JSON 형태로 저장
    const projectInfo = {
      address: newProjectAddress,
      source: newProjectSource || '',
      note: newProjectNote || ''
    };
    const description = JSON.stringify(projectInfo);
    
    await createAndSelectProject(newProjectName, description);
    setShowCreateModal(false);
    setNewProjectName('');
    setNewProjectAddress('');
    setNewProjectSource('');
    setNewProjectNote('');
  };

  // 프로젝트 선택 핸들러
  const handleSelectProject = async (projectId: string) => {
    const project = projects.find(p => p.project_id === projectId);
    if (project) {
      await selectProject(project);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 에러 토스트 - 다크 모드 */}
      {error.hasError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gray-900 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-w-md border border-gray-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-950/50 rounded-xl">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  오류가 발생했어요
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {error.message}
                </p>
              </div>
              <button
                onClick={clearError}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 - 고정 */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-gray-900 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            {/* 검색창 */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="프로젝트 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:bg-gray-800 focus:border-gray-600 focus:outline-none text-[14px] leading-[20px] text-gray-100 placeholder-gray-500 transition-all"
                />
              </div>
            </div>
            
            {/* 새 프로젝트 버튼 */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[14px] leading-[20px] font-medium whitespace-nowrap"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">새 프로젝트</span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="pt-16">
        {/* 프로젝트 그리드 */}
        <main className="p-4 sm:p-6 lg:p-8 pb-24">
          <div className="max-w-7xl mx-auto">
            {/* 인사말 */}
            <div className="mb-8">
              <h2 className="text-2xl font-medium text-gray-300 mb-1">
                <TypewriterText 
                  text="안녕하세요" 
                  delay={50}
                  onComplete={() => setShowSecondGreeting(true)}
                />
              </h2>
              {showSecondGreeting && (
                <h2 className="text-2xl font-medium text-white">
                  <TypewriterText 
                    text="오늘은 무엇을 도와드릴까요?" 
                    delay={50}
                  />
                </h2>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.project_id}
                    project={project}
                    onSelect={() => handleSelectProject(project.project_id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                  <Plus size={32} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchQuery ? '검색 결과가 없어요' : '아직 프로젝트가 없어요'}
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  {searchQuery ? '다른 검색어로 다시 시도해보세요' : '첫 프로젝트를 만들어보세요'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <Plus size={18} />
                    새 프로젝트 만들기
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-850 border-t border-gray-800 z-20" style={{ height: '56px' }}>
        <div className="h-full flex items-center justify-around">
          {/* 홈 (현재 페이지) */}
          <button
            className="flex flex-col items-center justify-center h-full flex-1 text-blue-400"
            onClick={() => router.push('/dashboard')}
          >
            <Home size={20} strokeWidth={1.5} />
            <span className="text-[10px] leading-[14px] mt-0.5 font-medium">홈</span>
          </button>

          {/* 파일저장소 */}
          <button
            className="flex flex-col items-center justify-center h-full flex-1 text-gray-400 hover:text-gray-200 transition-colors"
            onClick={() => router.push('/storage')}
          >
            <FolderOpen size={20} strokeWidth={1.5} />
            <span className="text-[10px] leading-[14px] mt-0.5">파일저장소</span>
          </button>

          {/* 앨범보관함 */}
          <button
            className="flex flex-col items-center justify-center h-full flex-1 text-gray-400 hover:text-gray-200 transition-colors"
            onClick={() => router.push('/gallery')}
          >
            <Images size={20} strokeWidth={1.5} />
            <span className="text-[10px] leading-[14px] mt-0.5">앨범보관함</span>
          </button>

          {/* 프로필관리 */}
          <button
            className="flex flex-col items-center justify-center h-full flex-1 text-gray-400 hover:text-gray-200 transition-colors"
            onClick={() => router.push('/profile')}
          >
            <User size={20} strokeWidth={1.5} />
            <span className="text-[10px] leading-[14px] mt-0.5">프로필관리</span>
          </button>
        </div>
      </nav>

      {/* 프로젝트 생성 모달 - 다크 모드 */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-md mx-auto my-auto shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              새 프로젝트 만들기
            </h2>
            
            <div className="space-y-5">
              {/* 프로젝트명 - 필수 */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  프로젝트명 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="예: 강남 아파트 리모델링"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:bg-gray-800/80 focus:border-blue-500 focus:outline-none text-white placeholder-gray-500 transition-all"
                  autoFocus
                />
              </div>
              
              {/* 주소 - 필수 */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  현장 주소 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newProjectAddress}
                  onChange={(e) => setNewProjectAddress(e.target.value)}
                  placeholder="예: 서울시 강남구 테헤란로 123"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:bg-gray-800/80 focus:border-blue-500 focus:outline-none text-white placeholder-gray-500 transition-all"
                />
              </div>

              {/* 유입 경로 - 선택 */}
              <div className="relative" ref={sourceDropdownRef}>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  유입 경로
                </label>
                <button
                  type="button"
                  onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:bg-gray-800/80 focus:border-blue-500 focus:outline-none text-white transition-all flex items-center justify-between"
                >
                  <span className={newProjectSource ? 'text-white' : 'text-gray-500'}>
                    {newProjectSource || '선택하세요'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${showSourceDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* 커스텀 드롭다운 - 다크 모드 */}
                {showSourceDropdown && (
                  <div className="absolute z-50 mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
                    {['웹사이트', '블로그', '인스타그램', '플랫폼', '지인', '기타'].map((source) => (
                      <button
                        key={source}
                        type="button"
                        onClick={() => {
                          setNewProjectSource(source);
                          setShowSourceDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                      >
                        {source}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 특이사항 - 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  특이사항
                </label>
                <textarea
                  value={newProjectNote}
                  onChange={(e) => setNewProjectNote(e.target.value)}
                  placeholder="예: 급한 공사, 예산 제한 있음 등"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:bg-gray-800/80 focus:border-blue-500 focus:outline-none text-white placeholder-gray-500 h-24 resize-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-5 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-2xl hover:bg-gray-700 transition-all font-medium text-sm"
              >
                취소
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || !newProjectAddress.trim()}
                className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}