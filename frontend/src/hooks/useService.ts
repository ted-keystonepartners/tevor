'use client';

import { useState, useCallback, useEffect } from 'react';
import { ServiceRegistry, initializeServices } from '@/services';
import { ServiceMessage } from '@/services/base/types';

export const useService = () => {
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  // 서비스 초기화 (컴포넌트 마운트 시 한 번만)
  useEffect(() => {
    const init = async () => {
      // ServiceRegistry가 자체적으로 초기화 상태 관리
      await initializeServices();
    };
    init();
  }, []); // 의존성 배열을 빈 배열로 변경

  // 서비스 활성화
  const activateService = useCallback(async (serviceId: string): Promise<ServiceMessage[]> => {
    try {
      const messages = await ServiceRegistry.activateService(serviceId);
      setActiveServiceId(serviceId);
      
      // 서비스 시작 메시지 처리
      const service = ServiceRegistry.get(serviceId);
      if (service) {
        const startMessages = await service.handleMessage('start');
        return [...messages, ...startMessages];
      }
      
      return messages;
    } catch (error) {
      console.error('Failed to activate service:', error);
      return [{
        type: 'text',
        content: '서비스를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.',
        metadata: { timestamp: Date.now() }
      }];
    }
  }, []);

  // 서비스 메시지 처리
  const handleServiceMessage = useCallback(async (message: string): Promise<ServiceMessage[]> => {
    const activeService = ServiceRegistry.getActiveService();
    if (activeService) {
      return activeService.handleMessage(message);
    }
    
    // 활성 서비스가 없으면 서비스 추천
    return ServiceRegistry.handleMessage(message);
  }, []);

  // 서비스 액션 처리
  const handleServiceAction = useCallback(async (actionId: string, data: any): Promise<ServiceMessage[]> => {
    const activeService = ServiceRegistry.getActiveService();
    if (activeService) {
      return activeService.handleAction(actionId, data);
    }
    
    return [{
      type: 'text',
      content: '활성화된 서비스가 없습니다.',
      metadata: { timestamp: Date.now() }
    }];
  }, []);

  // 서비스 비활성화
  const deactivateService = useCallback(async (): Promise<ServiceMessage[]> => {
    // 서비스 종료 전 요약 메시지 가져오기
    const activeService = ServiceRegistry.getActiveService();
    let summaryMessages: ServiceMessage[] = [];
    
    if (activeService) {
      // 서비스별 종료 메시지가 있다면 가져오기
      try {
        const serviceId = activeServiceId;
        summaryMessages = [{
          type: 'text',
          content: `[서비스 종료: ${serviceId}]`,
          metadata: {
            serviceId: serviceId || undefined,
            timestamp: Date.now()
          }
        }];
      } catch (error) {
        console.error('Failed to get service summary:', error);
      }
    }
    
    await ServiceRegistry.deactivateService();
    setActiveServiceId(null);
    
    return summaryMessages;
  }, [activeServiceId]);

  return {
    isInitialized: ServiceRegistry.getIsInitialized(),
    activeServiceId,
    activateService,
    handleServiceMessage,
    handleServiceAction,
    deactivateService
  };
};