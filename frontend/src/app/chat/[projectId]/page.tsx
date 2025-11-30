'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import { useProject } from '@/hooks/useProject';
import { useCurrentProject, useError, useUIActions } from '@/lib/store';
import { AlertCircle, ArrowLeft, Home, Loader2 } from 'lucide-react';

interface ChatPageParams {
  projectId: string;
}

export default function ChatPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { loadProject } = useProject();
  const currentProject = useCurrentProject();
  const error = useError();
  const { clearError } = useUIActions();

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
        console.error('프로젝트 초기화 실패:', error);
        // 에러가 발생해도 페이지에서 에러를 처리하도록 함
      } finally {
        setIsInitializing(false);
      }
    };

    initializeProject();
  }, [projectId, loadProject, currentProject?.project_id, router]);

  // 로딩 상태
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 size={24} className="text-blue-400 animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            프로젝트를 불러오는 중...
          </h2>
          <p className="text-gray-300">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    );
  }

  // 프로젝트를 찾을 수 없는 경우
  if (!currentProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-white mb-2">
            프로젝트를 찾을 수 없습니다
          </h2>
          <p className="text-gray-300 mb-6">
            요청하신 프로젝트가 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Home size={16} />
              홈으로 돌아가기
            </button>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={16} />
              이전 페이지
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 (다른 에러들)
  if (error.hasError && !isInitializing) {
    return (
      <div className="h-screen flex flex-col">
        {/* 에러 배너 */}
        <div className="bg-red-900/20 border-b border-red-800 p-4">
            <div className="flex items-center gap-3 max-w-6xl mx-auto">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200">
                  연결 문제가 발생했습니다
                </p>
                <p className="text-sm text-red-300">
                  {error.message}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-red-300 hover:text-red-100 font-medium"
                >
                  새로고침
                </button>
                <button
                  onClick={clearError}
                  className="text-red-300 hover:text-red-100 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
        </div>
        
        {/* 채팅 인터페이스는 에러와 함께 표시 */}
        <div className="flex-1">
          <ChatInterface projectId={projectId} />
        </div>
      </div>
    );
  }

  // 정상 상태 - 채팅 인터페이스 렌더링
  return <ChatInterface projectId={projectId} />;
}