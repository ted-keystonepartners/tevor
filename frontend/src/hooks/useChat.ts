import { useCallback } from 'react';
import { useAppStore, useChatActions, useCurrentProject, useMessages, useIsTyping, useLoading, useError, useTimelineActions, useUIActions } from '@/lib/store';
import { ChatMessage, TimelineEvent } from '@/lib/types';
import { api } from '@/lib/api';

export const useChat = () => {
  const currentProject = useCurrentProject();
  const messages = useMessages();
  const isTyping = useIsTyping();
  const loading = useLoading();
  const error = useError();
  
  const { 
    addMessage, 
    updateMessage, 
    setIsTyping,
    clearMessages 
  } = useChatActions();

  const {
    setLoading,
    setError,
    clearError,
  } = useUIActions();
  
  const { 
    addTimelineEvent, 
    clearTimeline 
  } = useTimelineActions();

  // 메시지 전송
  const sendMessage = useCallback(async (
    content: string, 
    type: 'user' | 'assistant' | 'system' = 'user',
    metadata?: ChatMessage['metadata']
  ) => {
    if (!currentProject) {
      setError({
        hasError: true,
        message: '프로젝트가 선택되지 않았습니다.',
      });
      return;
    }

    // 메시지 추가
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const message: ChatMessage = {
      id: messageId,
      type,
      content,
      timestamp,
      isNewMessage: true,
      metadata: {
        ...metadata,
        source: metadata?.source || (type === 'user' ? 'user' : 'gemini')
      }
    };

    addMessage(message);

    // AI 메시지나 시스템 메시지는 API 호출하지 않음
    if (type === 'assistant' || type === 'system') {
      return;
    }

    // 사용자 메시지인 경우에만 API 호출
    setIsTyping(true);
    setLoading({ isLoading: true });
    clearError();

    try {
      // 전체 대화 컨텍스트 준비
      const conversationHistory = messages
        .filter(msg => !msg.isPlaceholder)
        .map(msg => ({
          role: msg.type,
          content: msg.content,
          metadata: msg.metadata
        }))
        .slice(-20); // 최근 20개 메시지만 전송
      
      // API 호출
      const chatRequest = {
        project_id: currentProject.project_id,
        message: content,
        conversation_history: conversationHistory,
      };

      // 스트리밍 사용 여부 플래그
      const USE_STREAMING = true;  // 스트리밍 활성화
      
      if (USE_STREAMING) {
        // AI 응답을 위한 임시 메시지 생성
        const aiMessageId = `msg_stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const aiMessage: ChatMessage = {
          id: aiMessageId,
          type: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          isNewMessage: true,
          metadata: {
            source: 'gemini',
            isStreaming: true
          }
        };

        addMessage(aiMessage);
        
        // 스트리밍 시작 시 로딩 상태 즉시 해제
        setIsTyping(false);
        setLoading({ isLoading: false });

        // 스트리밍 API 호출
        await api.sendMessageStream(
          chatRequest,
          // onChunk: 텍스트 청크 수신 시
          (text: string) => {
            updateMessage(aiMessageId, (msg) => ({
              ...msg,
              content: msg.content + text
            }));
            
            // 부드러운 스크롤 (requestAnimationFrame 사용)
            requestAnimationFrame(() => {
              const messagesEnd = document.querySelector('[data-messages-end]');
              if (messagesEnd) {
                messagesEnd.scrollIntoView({ behavior: 'auto', block: 'end' });
              }
            });
          },
          // onComplete: 스트리밍 완료 시
          (messageId?: string) => {
            updateMessage(aiMessageId, (msg) => ({
              ...msg,
              id: messageId || msg.id,
              metadata: {
                ...msg.metadata,
                isStreaming: false
              }
            }));
            
            // 완료 시 최종 스크롤
            setTimeout(() => {
              const messagesEnd = document.querySelector('[data-messages-end]');
              if (messagesEnd) {
                messagesEnd.scrollIntoView({ behavior: 'smooth', block: 'end' });
              }
            }, 100);
          },
          // onError: 에러 발생 시
          (error: string) => {
            console.error('스트리밍 에러:', error);
            updateMessage(aiMessageId, (msg) => ({
              ...msg,
              content: msg.content || '응답을 생성하는 중 오류가 발생했습니다.',
              metadata: {
                ...msg.metadata,
                isStreaming: false,
                error: true
              }
            }));
          }
        );
      } else {
        // 일반 API 호출 (스트리밍 없이)
        const response = await api.sendMessage(chatRequest);

        // AI 응답 추가
        const aiMessage: ChatMessage = {
          id: response.id.toString(),
          type: 'assistant',
          content: response.response,
          timestamp: response.created_at,
          confidence: response.confidence,
          rag_context: response.rag_context,
          isNewMessage: true,
          metadata: {
            source: 'gemini'
          }
        };

        addMessage(aiMessage);
        
        // 비스트리밍 모드에서만 로딩 상태 해제
        setIsTyping(false);
        setLoading({ isLoading: false });
      }

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      
      setError({
        hasError: true,
        message: error instanceof Error ? error.message : '메시지 전송에 실패했습니다.',
      });
      
      // 에러 시 로딩 상태 해제
      setIsTyping(false);
      setLoading({ isLoading: false });
    }
  }, [currentProject, messages, addMessage, updateMessage, setIsTyping, setLoading, setError, clearError]);

  // 채팅 기록 불러오기
  const loadChatHistory = useCallback(async (projectId: string) => {
    setLoading({ isLoading: true });
    clearError();

    try {
      const historyResponse = await api.getChatHistory(projectId);
      
      const historyMessages: ChatMessage[] = historyResponse.messages.map((item: any) => ({
        id: item.id.toString(),
        type: item.type as 'user' | 'assistant',
        content: item.content,
        timestamp: item.timestamp,
        confidence: item.confidence || undefined,
        rag_context: item.rag_context || undefined,
        isNewMessage: false,
      }));

      const allMessages = historyMessages
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      useAppStore.getState().setMessages(allMessages);

    } catch (error) {
      console.error('채팅 기록 로딩 실패:', error);
      setError({
        hasError: true,
        message: error instanceof Error ? error.message : '채팅 기록을 불러오는데 실패했습니다.',
      });
    } finally {
      setLoading({ isLoading: false });
    }
  }, [setLoading, setError, clearError]);

  // 이미지와 함께 메시지 전송 (현재는 텍스트만 지원)
  const sendMessageWithImage = useCallback(async (file: File, message?: string) => {
    if (message && message.trim()) {
      await sendMessage(message.trim());
    }
  }, [sendMessage]);

  // 메시지 전송 가능 여부
  const canSendMessage = useCallback(() => {
    return !loading.isLoading && !error.hasError && !!currentProject;
  }, [loading.isLoading, error.hasError, currentProject]);

  return {
    messages,
    isTyping,
    loading,
    error,
    sendMessage,
    sendMessageWithImage,
    loadChatHistory,
    canSendMessage,
  };
};