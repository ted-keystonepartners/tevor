'use client';

import { useEffect, useState, useRef } from 'react';
import { useProject } from '@/hooks/useProject';
import { useError, useUIActions } from '@/lib/store';
import { Plus, Search, X, ChevronDown, Home, FolderOpen, Images, User, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProjectCard from '@/components/ProjectCard';
import TypewriterText from '@/components/TypewriterText';
import MainLayout from '@/components/layout/MainLayout';
import { api } from '@/lib/api';
import './dashboard.css';

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
  const [isMobile, setIsMobile] = useState(false);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    projects,
    loading,
    createAndSelectProject,
    selectProject,
    loadProjects,
  } = useProject();
  
  const error = useError();
  const { clearError } = useUIActions();

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 컴포넌트 마운트 시 프로젝트 목록 로드
  useEffect(() => {
    // 서버 깨우기 (헬스체크)
    api.healthCheck().catch(() => {
      console.log('서버를 깨우는 중...');
    });
    
    // 프로젝트 로드
    loadProjects();
  }, [loadProjects]);

  // 새 프로젝트 생성 이벤트 리스너
  useEffect(() => {
    const handleOpenCreateProject = () => {
      setShowCreateModal(true);
    };
    
    window.addEventListener('openCreateProject', handleOpenCreateProject);
    return () => window.removeEventListener('openCreateProject', handleOpenCreateProject);
  }, []);

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

  // 대시보드 콘텐츠
  const dashboardContent = (
    <>
      {/* 에러 토스트 */}
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

      {/* 데스크탑 헤더 */}
      {!isMobile && (
        <header className="bg-gray-900 border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">프로젝트</h1>
              <p className="text-sm text-gray-400 mt-1">진행 중인 프로젝트를 관리하세요</p>
            </div>
            <div className="flex items-center gap-4">
              {/* 검색창 */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="프로젝트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-600"
                />
              </div>
              {/* 새 프로젝트 버튼 (데스크탑) */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus size={18} />
                새 프로젝트
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 모바일 헤더 */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-30 bg-gray-900 px-4 py-3">
          <div className="flex items-center justify-center gap-4">
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[14px] leading-[20px] font-medium whitespace-nowrap"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">새 프로젝트</span>
            </button>
          </div>
        </header>
      )}

      {/* 메인 콘텐츠 */}
      <div className={isMobile ? 'pt-16' : 'bg-gray-900 min-h-screen'}>
        <main className={`${isMobile ? 'p-4 pb-24' : 'p-8'}`}>
          <div className={isMobile ? 'max-w-7xl mx-auto' : ''}>
            {/* 인사말 (데스크탑에서는 숨김) */}
            {isMobile && (
              <div className="mb-8">
                <h2 className="text-2xl font-medium text-gray-300 mb-1">
                  <TypewriterText 
                    text="안녕하세요" 
                    delay={25}
                    onComplete={() => setShowSecondGreeting(true)}
                  />
                </h2>
                {showSecondGreeting && (
                  <h2 className="text-2xl font-medium text-white">
                    <TypewriterText 
                      text="오늘은 어떤 프로젝트를 관리하시나요?" 
                      delay={25}
                    />
                  </h2>
                )}
              </div>
            )}

            {/* 프로젝트 그리드 */}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="relative mb-6">
                  <div className="w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="w-16 h-16 rounded-full border-4 border-gray-800"></div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full animate-spin">
                      <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500"></div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-sm animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 font-medium">프로젝트 목록을 불러오는 중...</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className={`grid grid-cols-1 ${isMobile ? 'md:grid-cols-2' : 'lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'} gap-6`}>
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

      {/* 모바일 하단 네비게이션 */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-850 border-t border-gray-800 z-20" style={{ height: '56px' }}>
          <div className="h-full flex items-center justify-around">
            <button
              className="flex flex-col items-center justify-center h-full flex-1 text-blue-400"
              onClick={() => router.push('/dashboard')}
            >
              <Home size={20} strokeWidth={1.5} />
              <span className="text-[10px] leading-[14px] mt-0.5 font-medium">홈</span>
            </button>
            <button
              className="flex flex-col items-center justify-center h-full flex-1 text-gray-400 hover:text-gray-200 transition-colors"
              onClick={() => router.push('/storage')}
            >
              <FolderOpen size={20} strokeWidth={1.5} />
              <span className="text-[10px] leading-[14px] mt-0.5">파일저장소</span>
            </button>
            <button
              className="flex flex-col items-center justify-center h-full flex-1 text-gray-400 hover:text-gray-200 transition-colors"
              onClick={() => router.push('/gallery')}
            >
              <Images size={20} strokeWidth={1.5} />
              <span className="text-[10px] leading-[14px] mt-0.5">앨범보관함</span>
            </button>
            <button
              className="flex flex-col items-center justify-center h-full flex-1 text-gray-400 hover:text-gray-200 transition-colors"
              onClick={() => router.push('/profile')}
            >
              <User size={20} strokeWidth={1.5} />
              <span className="text-[10px] leading-[14px] mt-0.5">프로필관리</span>
            </button>
          </div>
        </nav>
      )}

      {/* 새 프로젝트 생성 모달 (공통) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-850 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">새 프로젝트 만들기</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">프로젝트명 *</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="예: 강남 아파트 리모델링"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">시공 주소 *</label>
                <input
                  type="text"
                  value={newProjectAddress}
                  onChange={(e) => setNewProjectAddress(e.target.value)}
                  placeholder="예: 서울시 강남구 삼성동 123-45"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">유입 경로</label>
                <div className="relative" ref={sourceDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-left text-white focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between"
                  >
                    <span className={newProjectSource ? 'text-white' : 'text-gray-500'}>
                      {newProjectSource || '선택하세요'}
                    </span>
                    <ChevronDown size={18} className="text-gray-400" />
                  </button>
                  {showSourceDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-850 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                      {['온라인 광고', '지인 소개', '직접 문의', '기타'].map((source) => (
                        <button
                          key={source}
                          type="button"
                          onClick={() => {
                            setNewProjectSource(source);
                            setShowSourceDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                          {source}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">메모</label>
                <textarea
                  value={newProjectNote}
                  onChange={(e) => setNewProjectNote(e.target.value)}
                  placeholder="프로젝트 관련 메모를 입력하세요"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectName('');
                  setNewProjectAddress('');
                  setNewProjectSource('');
                  setNewProjectNote('');
                }}
                className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || !newProjectAddress.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                생성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <MainLayout>
      {dashboardContent}
    </MainLayout>
  );
}