'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ChatInterfaceProps } from '@/lib/types';
import { useChat } from '@/hooks/useChat';
import { useService } from '@/hooks/useService';
import { useCurrentProject, useError } from '@/lib/store';
import ChatBubble from './ChatBubble';
import InputArea from './InputArea';
import ChatServiceButtons from './ChatServiceButtons';
import TypewriterText from './TypewriterText';
import { AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ServiceMessage } from '@/services/base/types';

export default function ChatInterface({ projectId }: ChatInterfaceProps) {
  const router = useRouter();
  const currentProject = useCurrentProject();
  const error = useError();
  
  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showSecondText, setShowSecondText] = useState(false);
  
  const {
    messages,
    isTyping,
    loading,
    sendMessage: originalSendMessage,
    sendMessageWithImage,
    canSendMessage,
    loadChatHistory,
  } = useChat();
  
  const {
    isInitialized,
    activeServiceId,
    activateService,
    handleServiceMessage,
    handleServiceAction,
  } = useService();


  // 채팅 히스토리 로드
  useEffect(() => {
    if (currentProject && projectId && currentProject.project_id === projectId && !hasLoaded) {
      loadChatHistory(projectId);
      setHasLoaded(true);
    }
  }, [currentProject, projectId, hasLoaded, loadChatHistory]);

  // 단순한 자동 스크롤: 여백이 자동으로 적절한 위치 보정
  useEffect(() => {
    if (messages.length > 0) {
      // 그냥 맨 아래로 스크롤 - 여백이 알아서 위치 조정
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages.length]);

  // AI 응답 완료 시 최종 위치 보정
  useEffect(() => {
    if (!isTyping && !loading.isLoading && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [isTyping, loading.isLoading, messages.length]);





  // 프로젝트가 로드되지 않은 경우
  if (!currentProject) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mb-4" />
          <p className="text-gray-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error.hasError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 헤더 */}
      <header className="flex items-center justify-between p-4 bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="프로젝트 목록으로 돌아가기"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">
              {currentProject.name}
            </h1>
            {currentProject.description && (
              <p className="text-sm text-gray-400">
                {currentProject.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/archive/${projectId}`)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="보관함 보기"
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">보관함</span>
          </button>
        </div>
      </header>

      {/* 메인 컨테이너 */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          {/* 메시지 목록 */}
          <div 
            ref={messagesContainerRef} 
            className="flex-1 overflow-y-auto p-4 space-y-4 relative [&::-webkit-scrollbar]:hidden"
            style={{ 
              overflowAnchor: 'none',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <div className="max-w-4xl mx-auto">
            {/* 초기 메시지 */}
            {messages.length === 0 && !loading.isLoading && (
              <div className="py-8">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-12">
                    <h3 className="text-xl font-normal text-gray-300 mb-2">
                      <TypewriterText 
                        text="안녕하세요" 
                        delay={60}
                        onComplete={() => setShowSecondText(true)}
                      />
                    </h3>
                    {showSecondText && (
                      <p className="text-2xl font-medium text-white">
                        <TypewriterText 
                          text="무엇을 도와드릴까요?" 
                          delay={60}
                          onComplete={() => setShowButtons(true)}
                        />
                      </p>
                    )}
                  </div>
                  {showButtons && (
                    <div className="animate-fadeIn">
                      <ChatServiceButtons onServiceSelect={handleServiceSelect} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 메시지 목록 */}
            {messages.map((message, index) => (
              <div key={message.id}>
                <ChatBubble message={message} />
              </div>
            ))}

            {/* 구글 스타일 로딩 스피너 */}
            {loading.isLoading && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
              </div>
            )}

            {/* 바닥 요소 */}
            <div ref={messagesEndRef} style={{ height: 'calc(100vh - 465px)', flexShrink: 0 }} />
            </div>
          </div>

          {/* 입력 영역 */}
          <InputArea
            onSendMessage={sendMessage}
            onUploadFile={sendMessageWithImage}
            isLoading={loading.isLoading}
            disabled={!canSendMessage}
          />
        </div>
      </div>
    </div>
  );
}