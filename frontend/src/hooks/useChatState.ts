import { useState, useCallback } from 'react';
import { ChatMode } from '@/lib/types';

interface ChatState {
  mode: ChatMode;
  activeServiceId: string | null;
  isTransitioning: boolean;
}

export function useChatState() {
  const [state, setState] = useState<ChatState>({
    mode: ChatMode.AI,
    activeServiceId: null,
    isTransitioning: false
  });

  // 서비스 시작
  const startService = useCallback((serviceId: string) => {
    setState({
      mode: ChatMode.TRANSITION,
      activeServiceId: serviceId,
      isTransitioning: true
    });

    // 전환 애니메이션 후 서비스 모드로
    setTimeout(() => {
      setState({
        mode: ChatMode.SERVICE,
        activeServiceId: serviceId,
        isTransitioning: false
      });
    }, 300);
  }, []);

  // 서비스 종료
  const endService = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: ChatMode.TRANSITION,
      isTransitioning: true
    }));

    // 전환 애니메이션 후 AI 모드로
    setTimeout(() => {
      setState({
        mode: ChatMode.AI,
        activeServiceId: null,
        isTransitioning: false
      });
    }, 300);
  }, []);

  // Gemini 활성화 여부
  const isGeminiEnabled = state.mode === ChatMode.AI && !state.isTransitioning;
  
  // 서비스 활성화 여부
  const isServiceActive = state.mode === ChatMode.SERVICE && !state.isTransitioning;

  return {
    mode: state.mode,
    activeServiceId: state.activeServiceId,
    isTransitioning: state.isTransitioning,
    isGeminiEnabled,
    isServiceActive,
    startService,
    endService
  };
}