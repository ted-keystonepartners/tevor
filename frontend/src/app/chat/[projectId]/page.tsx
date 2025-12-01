'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import { useProject } from '@/hooks/useProject';
import { useCurrentProject, useError, useUIActions } from '@/lib/store';
import { AlertCircle, ArrowLeft, Home, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

interface ChatPageParams {
  projectId: string;
}

export default function ChatPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const { loadProject } = useProject();
  const currentProject = useCurrentProject();
  const error = useError();
  const { clearError } = useUIActions();

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 프로젝트 로드
  useEffect(() => {
    const initializeProject = async () => {
      if (!projectId) {
        router.push('/');
        return;
      }

      setIsInitializing(true);
      
      try {
        // 이미 같은 프로젝트가 로드되어 있으면 스킵
        if (currentProject?.project_id === projectId) {
          setIsInitializing(false);
          return;
        }

        const project = await loadProject(projectId);
        
        if (!project) {
          // 프로젝트를 찾을 수 없으면 홈으로 리다이렉트
          router.push('/');
          return;
        }
        
      } catch (error) {
        console.error('프로젝트 로드 실패:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeProject();
  }, [projectId, currentProject?.project_id, loadProject, router]);

  // 로딩 중
  if (isInitializing) {
    const loadingContent = (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );

    if (isMobile) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
          {loadingContent}
        </div>
      );
    }

    return <MainLayout>{loadingContent}</MainLayout>;
  }

  // 에러 상태
  if (error.hasError) {
    const errorContent = (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              오류가 발생했습니다
            </h2>
            <p className="text-gray-400 mb-6">
              {error.message || '프로젝트를 불러올 수 없습니다.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  clearError();
                  router.push('/dashboard');
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Home size={18} />
                홈으로
              </button>
              <button
                onClick={() => {
                  clearError();
                  window.location.reload();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    if (isMobile) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
          {errorContent}
        </div>
      );
    }

    return <MainLayout>{errorContent}</MainLayout>;
  }

  // 프로젝트가 없는 경우
  if (!currentProject || currentProject.project_id !== projectId) {
    const noProjectContent = (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            프로젝트를 찾을 수 없습니다
          </h2>
          <p className="text-gray-400 mb-6">
            요청하신 프로젝트가 존재하지 않거나 삭제되었습니다.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={18} />
            프로젝트 목록으로
          </button>
        </div>
      </div>
    );

    if (isMobile) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
          {noProjectContent}
        </div>
      );
    }

    return <MainLayout>{noProjectContent}</MainLayout>;
  }

  // 정상적으로 채팅 인터페이스 렌더링
  const chatContent = <ChatInterface projectId={projectId} />;

  // 모바일에서는 전체 화면, 데스크탑에서는 레이아웃 안에
  if (isMobile) {
    return chatContent;
  }

  return <MainLayout>{chatContent}</MainLayout>;
}