'use client';

import { ArrowLeft, Images, Home, FolderOpen, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GalleryPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 - 고정 */}
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
              앨범보관함
            </h1>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="pt-16">
        <main className="p-4 sm:p-6 lg:p-8 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                <Images size={32} className="text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                업데이트 예정
              </h2>
              <p className="text-sm text-gray-400 text-center">
                앨범보관함 기능이 곧 추가될 예정입니다
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* 하단 네비게이션 바 */}
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

          {/* 앨범보관함 (현재 페이지) */}
          <button
            className="flex flex-col items-center justify-center h-full flex-1 text-blue-400"
            onClick={() => router.push('/gallery')}
          >
            <Images size={20} strokeWidth={1.5} />
            <span className="text-[10px] leading-[14px] mt-0.5 font-medium">앨범보관함</span>
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
    </div>
  );
}