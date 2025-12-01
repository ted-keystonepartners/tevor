'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import React from 'react';
import { ChatInterfaceProps } from '@/lib/types';
import { useChat } from '@/hooks/useChat';
import { useService } from '@/hooks/useService';
import { useChatState } from '@/hooks/useChatState';
import { useCurrentProject } from '@/lib/store';
import { ServiceRegistry } from '@/services';
import { MessageRouter } from '@/services/MessageRouter';
import { ChatMode } from '@/lib/types';
import ChatBubble from './ChatBubble';
import InputArea from './InputArea';
import ChatServiceButtons from './ChatServiceButtons';
import TypewriterText from './TypewriterText';
import ServiceActivationCard from './ServiceActivationCard';
import ServiceStatusIndicator from './ServiceStatusIndicator';

export default function ChatInterfaceDesktop({ projectId }: ChatInterfaceProps) {
  const currentProject = useCurrentProject();
  
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

  // 자동 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages.length]);
  
  useEffect(() => {
    if (serviceComponents.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [serviceComponents.length]);

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
    
    startService(serviceId);
    
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
      const serviceMessages = await activateService(serviceId);
      
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
      
      if (serviceId === 'premium-demolition') {
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
        }, 3200);
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

  // 메시지 전송
  const sendMessage = useCallback(async (message: string) => {    
    const routing = await messageRouter.routeMessage(message, mode, activeServiceId);
    
    switch (routing.action) {
      case 'activate_service':
        if (routing.serviceId) {
          await handleServiceSelect(routing.serviceId);
        }
        break;
        
      case 'deactivate_service':
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
        originalSendMessage(message, 'user', { source: 'user' });
        break;
    }
  }, [mode, activeServiceId, messageRouter, handleServiceMessage, originalSendMessage, handleServiceSelect, deactivateService, endService]);

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mb-4" />
          <p className="text-gray-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="bg-gray-900 px-6 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-white">
                {currentProject.name}
              </h1>
              {(() => {
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

      {/* 메시지 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
                {message.metadata?.serviceActivation && (
                  <ServiceActivationCard
                    serviceName={message.metadata.serviceActivation.name}
                    serviceEmoji={message.metadata.serviceActivation.emoji}
                    type={message.metadata.serviceActivation.type as 'start' | 'end'}
                  />
                )}
                {!message.metadata?.serviceActivation && (
                  <ChatBubble message={message} />
                )}
              </React.Fragment>
            ))}

            {/* 서비스 컴포넌트 */}
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

            <div ref={messagesEndRef} data-messages-end />
          </div>
        </div>

        {/* 입력 영역 */}
        <InputArea
          onSendMessage={sendMessage}
          onUploadFile={sendMessageWithImage}
          isLoading={loading.isLoading}
          disabled={!canSendMessage || mode === ChatMode.TRANSITION || isServiceActive}
          onServiceSelect={handleServiceSelect}
          placeholder={
            isServiceActive ? 
              '서비스 진행 중...' : 
              '메시지를 입력하세요...'
          }
        />
      </div>
    </>
  );
}