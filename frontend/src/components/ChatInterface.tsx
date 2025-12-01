'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import React from 'react';
import { ChatInterfaceProps } from '@/lib/types';
import { useChat } from '@/hooks/useChat';
import { useService } from '@/hooks/useService';
import { useChatState } from '@/hooks/useChatState';
import { useCurrentProject, useError } from '@/lib/store';
import { ServiceRegistry } from '@/services';
import { MessageRouter } from '@/services/MessageRouter';
import { ChatMode } from '@/lib/types';
import ChatBubble from './ChatBubble';
import InputArea from './InputArea';
import ChatServiceButtons from './ChatServiceButtons';
import TypewriterText from './TypewriterText';
import ServiceActivationCard from './ServiceActivationCard';
import ServiceStatusIndicator from './ServiceStatusIndicator';
import { AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const [serviceComponents, setServiceComponents] = useState<React.ReactElement[]>([]);
  
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
    activateService,
    handleServiceMessage,
    handleServiceAction,
    deactivateService
  } = useService();
  
  const {
    mode,
    activeServiceId,
    isGeminiEnabled,
    isServiceActive,
    startService,
    endService
  } = useChatState();
  
  const messageRouter = MessageRouter.getInstance();

  // 채팅 히스토리 로드
  useEffect(() => {
    if (currentProject && projectId && currentProject.project_id === projectId && !hasLoaded) {
      loadChatHistory(projectId);
      setHasLoaded(true);
    }
  }, [currentProject, projectId, hasLoaded, loadChatHistory]);

  // 자동 스크롤 - 새 메시지가 추가될 때만 실행
  useEffect(() => {
    // 메시지 개수가 변경되었을 때만 스크롤 (내용 변경은 무시)
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages.length]); // 메시지 개수 변경 시에만
  
  // 서비스 컴포넌트가 표시될 때만 스크롤 (초기 버튼은 제외)
  useEffect(() => {
    if (serviceComponents.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [serviceComponents.length]); // 컴포넌트 개수 변경 시

  // 서비스 정보 매핑
  const serviceInfo: Record<string, { name: string; emoji: string }> = {
    'premium-demolition': { name: '프리미엄철거', emoji: '🏭' },
    'site-photo': { name: '현장사진기록', emoji: '📸' },
    'ai-styling': { name: 'AI스타일링', emoji: '✨' },
    'payment-agency': { name: '결제대행서비스', emoji: '🐳' },
    'as-center': { name: 'AS센터', emoji: '🔧' }
  };

  // 서비스 선택 핸들러
  const handleServiceSelect = useCallback(async (serviceId: string) => {
    console.log('Service selected:', serviceId);
    
    // 모드 전환
    startService(serviceId);
    
    // 서비스 시작 메시지 추가
    const info = serviceInfo[serviceId];
    if (info) {
      originalSendMessage(
        `service_activation_${info.name}_start`,
        'system',
        { 
          source: 'system', 
          serviceActivation: { 
            name: info.name, 
            emoji: info.emoji,
            type: 'start'
          } 
        }
      );
    }
    
    try {
      // 서비스 활성화
      const serviceMessages = await activateService(serviceId);
      
      // 메시지 표시
      serviceMessages.forEach(msg => {
        if (msg.type === 'text' && msg.content) {
          originalSendMessage(
            msg.content, 
            'assistant',
            { source: 'service', serviceId }
          );
        } else if (msg.type === 'component' && msg.component) {
          setServiceComponents(prev => [...prev, msg.component as React.ReactElement]);
        }
      });
      
      // 프리미엄철거 서비스인 경우 메시지 타이핑 완료 후 사진 업로드 컴포넌트 표시
      if (serviceId === 'premium-demolition') {
        // 메시지 길이 계산 (한글 포함 약 100자)
        // 타이핑 속도 25ms * 100자 = 2500ms + startDelay 300ms = 2800ms
        // 여유를 두고 3200ms 후 표시
        setTimeout(async () => {
          const service = ServiceRegistry.get(serviceId);
          if (service) {
            const photoMessages = await service.handleMessage('show_photo_upload');
            photoMessages.forEach(msg => {
              if (msg.type === 'component' && msg.component) {
                setServiceComponents(prev => [...prev, msg.component as React.ReactElement]);
              }
            });
          }
        }, 3200); // 타이핑 완료 직후 표시
      }
    } catch (error) {
      console.error('Failed to activate service:', error);
      originalSendMessage(
        '서비스를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.', 
        'assistant',
        { source: 'service', serviceId }
      );
    }
  }, [activateService, originalSendMessage, startService]);

  // 메시지 전송 (라우터 사용)
  const sendMessage = useCallback(async (message: string) => {    
    // 메시지 라우팅
    const routing = await messageRouter.routeMessage(message, mode, activeServiceId);
    
    switch (routing.action) {
      case 'activate_service':
        // 서비스 활성화
        if (routing.serviceId) {
          await handleServiceSelect(routing.serviceId);
        }
        break;
        
      case 'deactivate_service':
        // 서비스 종료
        const currentServiceInfo = serviceInfo[activeServiceId || ''];
        if (currentServiceInfo) {
          originalSendMessage(
            `service_activation_${currentServiceInfo.name}_end`,
            'system',
            { 
              source: 'system', 
              serviceActivation: { 
                name: currentServiceInfo.name, 
                emoji: currentServiceInfo.emoji,
                type: 'end'
              } 
            }
          );
        }
        
        const messages = await deactivateService();
        messages.forEach(msg => {
          if (msg.type === 'text' && msg.content) {
            originalSendMessage(msg.content, 'system', { source: 'service' });
          }
        });
        setServiceComponents([]);
        endService();
        break;
        
      case 'service_handle':
        // 서비스가 메시지 처리
        originalSendMessage(message, 'user', { source: 'user', serviceId: activeServiceId || undefined });
        
        try {
          const serviceMessages = await handleServiceMessage(message);
          
          serviceMessages.forEach(msg => {
            if (msg.type === 'text' && msg.content) {
              originalSendMessage(
                msg.content, 
                'assistant',
                { source: 'service', serviceId: activeServiceId || undefined, serviceData: msg.metadata }
              );
            } else if (msg.type === 'component' && msg.component) {
              setServiceComponents(prev => [...prev, msg.component as React.ReactElement]);
            }
          });
        } catch (error) {
          console.error('Service message handling failed:', error);
          originalSendMessage(
            '서비스 처리 중 오류가 발생했습니다.', 
            'assistant',
            { source: 'service', serviceId: activeServiceId || undefined }
          );
        }
        break;
        
      case 'gemini_chat':
      default:
        // Gemini가 처리
        originalSendMessage(message, 'user', { source: 'user' });
        break;
    }
  }, [mode, activeServiceId, messageRouter, handleServiceMessage, originalSendMessage, handleServiceSelect, deactivateService, endService]);

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
      <header className="fixed top-0 left-0 right-0 z-30 bg-gray-900 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="대시보드로 돌아가기"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {currentProject.name}
                </h1>
            {(() => {
              // description에서 정보 파싱
              let displayText = '';
              try {
                if (currentProject.description && currentProject.description.startsWith('{')) {
                  const info = JSON.parse(currentProject.description);
                  if (info.address) {
                    displayText = info.address;
                  }
                } else if (currentProject.description) {
                  displayText = currentProject.description;
                }
              } catch (e) {
                displayText = currentProject.description || '';
              }
              
              return displayText ? (
                <p className="text-sm text-gray-400">
                  {displayText}
                </p>
              ) : null;
            })()}
              </div>
            </div>
            
            {/* 서비스 상태 표시 */}
            {isServiceActive && activeServiceId && (
              <ServiceStatusIndicator
            serviceId={activeServiceId}
            onStop={async () => {
              // 서비스 종료 메시지 추가
              const currentServiceInfo = serviceInfo[activeServiceId];
              if (currentServiceInfo) {
                originalSendMessage(
                  `service_activation_${currentServiceInfo.name}_end`,
                  'system',
                  { 
                    source: 'system', 
                    serviceActivation: { 
                      name: currentServiceInfo.name, 
                      emoji: currentServiceInfo.emoji,
                      type: 'end'
                    } 
                  }
                );
              }
              
              // 서비스 종료
              const messages = await deactivateService();
              messages.forEach(msg => {
                if (msg.type === 'text' && msg.content) {
                  originalSendMessage(msg.content, 'system', { source: 'service' });
                }
              });
              setServiceComponents([]);
              endService();
            }}
            />
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨테이너 */}
      <div className="flex-1 flex overflow-hidden pt-16">
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
            {messages.length === 0 && serviceComponents.length === 0 && !loading.isLoading && (
              <div className="pt-4 pb-8">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8">
                    <h3 className="text-xl font-normal text-gray-300 mb-2">
                      <TypewriterText 
                        text="필요하신 서비스를 선택해주세요" 
                        delay={30}
                        onComplete={() => {
                          setShowSecondText(true);
                        }}
                      />
                    </h3>
                    {showSecondText && (
                      <p className="text-2xl font-medium text-white">
                        <TypewriterText 
                          text="채팅으로도 문의하실 수 있어요" 
                          delay={30}
                          onComplete={() => {
                            setShowButtons(true);
                          }}
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
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                {/* 서비스 활성화/종료 카드 표시 */}
                {message.metadata?.serviceActivation && (
                  <ServiceActivationCard
                    serviceName={message.metadata.serviceActivation.name}
                    serviceEmoji={message.metadata.serviceActivation.emoji}
                    type={message.metadata.serviceActivation.type as 'start' | 'end'}
                  />
                )}
                {/* 일반 메시지는 시스템 메시지가 아닌 경우만 표시 */}
                {!message.metadata?.serviceActivation && (
                  <ChatBubble message={message} />
                )}
              </React.Fragment>
            ))}

            {/* 서비스 컴포넌트 렌더링 */}
            {serviceComponents.map((component, index) => (
              <div key={`service-component-${index}`} className="my-4 animate-fadeIn">
                {component}
              </div>
            ))}

            {/* 로딩 스피너 */}
            {loading.isLoading && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
              </div>
            )}

            {/* 스크롤 끝 지점 */}
            <div ref={messagesEndRef} data-messages-end />
            </div>
          </div>

          {/* 입력 영역 */}
          <InputArea
            onSendMessage={sendMessage}
            onUploadFile={sendMessageWithImage}
            isLoading={loading.isLoading}
            disabled={!canSendMessage || mode === ChatMode.TRANSITION || isServiceActive}  // 서비스 활성화 시에도 비활성화
            onServiceSelect={handleServiceSelect}
            placeholder={
              isServiceActive ? 
                '서비스 진행 중...' : 
                '메시지를 입력하세요...'
            }
          />
        </div>
      </div>
    </div>
  );
}