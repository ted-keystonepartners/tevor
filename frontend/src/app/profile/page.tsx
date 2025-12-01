'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Home, FolderOpen, Images, ChevronRight, LogOut, Settings, Bell, Shield, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

export default function ProfilePage() {
  const router = useRouter();
  const [userName] = useState('사용자'); // 실제로는 상태 관리에서 가져와야 함
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    // 로그아웃 처리 로직
    // 예: 토큰 삭제, 상태 초기화 등
    router.push('/');
  };

  const profileContent = (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 - 모바일에서만 표시 */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-30 bg-gray-900 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="대시보드로 돌아가기"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="ml-3 text-lg font-semibold text-white">
                프로필관리
              </h1>
            </div>
          </div>
        </header>
      )}

      {/* 메인 콘텐츠 */}
      <div className={isMobile ? "pt-16" : ""}>
        <main className="p-4 sm:p-6 lg:p-8 pb-24">
          <div className="max-w-7xl mx-auto">
            {/* 프로필 정보 섹션 */}
            <div className="mb-8">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <User size={28} className="text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{userName}</h2>
                    <p className="text-sm text-gray-400">일반 사용자</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 메뉴 섹션 */}
            <div className="space-y-4">
              {/* 기본 정보 관리 */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-750 transition-colors"
                  onClick={() => {/* 기본정보 관리 페이지로 이동 */}}
                >
                  <div className="flex items-center gap-3">
                    <Settings size={20} className="text-gray-400" />
                    <span className="text-white">기본정보 관리</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
              </div>

              {/* 알림 설정 */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-750 transition-colors"
                  onClick={() => {/* 알림 설정 페이지로 이동 */}}
                >
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-gray-400" />
                    <span className="text-white">알림 설정</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
              </div>

              {/* 개인정보 보호 */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-750 transition-colors"
                  onClick={() => {/* 개인정보 보호 페이지로 이동 */}}
                >
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-gray-400" />
                    <span className="text-white">개인정보 보호</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
              </div>

              {/* 고객지원 */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-750 transition-colors"
                  onClick={() => {/* 고객지원 페이지로 이동 */}}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={20} className="text-gray-400" />
                    <span className="text-white">고객지원</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
              </div>

              {/* 로그아웃 */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-750 transition-colors"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={20} className="text-red-400" />
                    <span className="text-red-400">로그아웃</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* 버전 정보 */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">버전 1.0.0</p>
            </div>
          </div>
        </main>
      </div>

      {/* 하단 네비게이션 바 - 모바일에서만 표시 */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-850 border-t border-gray-800 z-20" style={{ height: '56px' }}>
        <div className="h-full flex items-center justify-around">
          {/* 홈 */}
          <button
            className="flex flex-col items-center justify-center h-full flex-1 text-gray-400 hover:text-gray-200 transition-colors"
            onClick={() => router.push('/dashboard')}
          >
            <Home size={20} strokeWidth={1.5} />
            <span className="text-[10px] leading-[14px] mt-0.5">홈</span>
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

          {/* 프로필관리 (현재 페이지) */}
          <button
            className="flex flex-col items-center justify-center h-full flex-1 text-blue-400"
            onClick={() => router.push('/profile')}
          >
            <User size={20} strokeWidth={1.5} />
            <span className="text-[10px] leading-[14px] mt-0.5 font-medium">프로필관리</span>
          </button>
        </div>
        </nav>
      )}
    </div>
  );

  return (
    <MainLayout>
      {profileContent}
    </MainLayout>
  );
}