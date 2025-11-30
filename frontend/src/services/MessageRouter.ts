import { ChatMode } from '@/lib/types';
import { ServiceRegistry } from './registry/ServiceRegistry';

export class MessageRouter {
  private static instance: MessageRouter;

  private constructor() {}

  static getInstance(): MessageRouter {
    if (!MessageRouter.instance) {
      MessageRouter.instance = new MessageRouter();
    }
    return MessageRouter.instance;
  }

  // 서비스 명령어 체크
  isServiceCommand(message: string): boolean {
    const serviceKeywords = {
      '프리미엄철거': 'premium-demolition',
      '철거': 'premium-demolition',
      '현장사진': 'site-photo',
      '사진기록': 'site-photo',
      'AI스타일링': 'ai-styling',
      '스타일링': 'ai-styling',
      '결제대행': 'payment-agency',
      '결제': 'payment-agency',
      'AS센터': 'as-center',
      'AS': 'as-center'
    };

    const lowerMessage = message.toLowerCase();
    for (const [keyword, serviceId] of Object.entries(serviceKeywords)) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  // 서비스 ID 추출
  extractServiceId(message: string): string | null {
    const serviceKeywords = {
      '프리미엄철거': 'premium-demolition',
      '철거': 'premium-demolition',
      '현장사진': 'site-photo',
      '사진기록': 'site-photo',
      'AI스타일링': 'ai-styling',
      '스타일링': 'ai-styling',
      '결제대행': 'payment-agency',
      '결제': 'payment-agency',
      'AS센터': 'as-center',
      'AS': 'as-center'
    };

    const lowerMessage = message.toLowerCase();
    for (const [keyword, serviceId] of Object.entries(serviceKeywords)) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return serviceId;
      }
    }
    return null;
  }

  // 종료 명령어 체크
  isExitCommand(message: string): boolean {
    const exitKeywords = ['종료', '끝', '나가기', '중단', '취소', 'exit', 'quit', 'stop'];
    const lowerMessage = message.toLowerCase();
    return exitKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // 메시지 라우팅
  async routeMessage(
    message: string,
    mode: ChatMode,
    activeServiceId: string | null
  ): Promise<{
    action: 'activate_service' | 'deactivate_service' | 'service_handle' | 'gemini_chat';
    serviceId?: string;
    message: string;
  }> {
    // 1. 서비스 모드인 경우
    if (mode === ChatMode.SERVICE && activeServiceId) {
      // 종료 명령어 체크
      if (this.isExitCommand(message)) {
        return {
          action: 'deactivate_service',
          message
        };
      }
      // 서비스가 처리
      return {
        action: 'service_handle',
        serviceId: activeServiceId,
        message
      };
    }

    // 2. AI 모드인 경우
    if (mode === ChatMode.AI) {
      // 서비스 명령어 체크
      if (this.isServiceCommand(message)) {
        const serviceId = this.extractServiceId(message);
        if (serviceId) {
          return {
            action: 'activate_service',
            serviceId,
            message
          };
        }
      }
      // 일반 AI 대화
      return {
        action: 'gemini_chat',
        message
      };
    }

    // 3. 전환 중인 경우 - 대기
    return {
      action: 'gemini_chat', // 기본값
      message
    };
  }
}