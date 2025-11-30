import { BaseService } from '../base/BaseService';
import { ServiceConfig, ServiceMessage, ServiceContext } from '../base/types';

class ServiceRegistryClass {
  private services: Map<string, BaseService>;
  private activeService: BaseService | null;
  private context: ServiceContext;
  private activationLock: boolean;
  private activationQueue: Array<() => Promise<void>>;
  private isInitialized: boolean;

  constructor() {
    this.services = new Map();
    this.activeService = null;
    this.context = {};
    this.activationLock = false;
    this.activationQueue = [];
    this.isInitialized = false;
  }

  // 서비스 등록
  register(service: BaseService): void {
    const config = service.getConfig();
    if (this.services.has(config.id)) {
      // 이미 등록된 서비스는 건너뜀
      return;
    }
    this.services.set(config.id, service);
    console.log(`Service ${config.name} (${config.id}) registered successfully`);
  }

  // 서비스 해제
  unregister(serviceId: string): void {
    if (this.services.has(serviceId)) {
      const service = this.services.get(serviceId);
      if (this.activeService === service) {
        this.deactivateService();
      }
      this.services.delete(serviceId);
      console.log(`Service ${serviceId} unregistered`);
    }
  }

  // 서비스 가져오기
  get(serviceId: string): BaseService | undefined {
    return this.services.get(serviceId);
  }

  // 서비스 목록
  list(): ServiceConfig[] {
    return Array.from(this.services.values()).map(service => service.getConfig());
  }

  // 초기화 상태 확인
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // 초기화 상태 설정
  setIsInitialized(value: boolean): void {
    this.isInitialized = value;
  }

  // 활성화된 서비스 목록 (enabled인 서비스들만)
  listEnabled(): ServiceConfig[] {
    return Array.from(this.services.values())
      .map(service => service.getConfig())
      .filter(config => config.enabled);
  }

  // 서비스 활성화 - 동시성 문제 해결
  async activateService(serviceId: string): Promise<ServiceMessage[]> {
    // 이미 활성화 중이면 대기
    if (this.activationLock) {
      console.warn(`[ServiceRegistry] Activation in progress. Queueing request for ${serviceId}`);
      
      return new Promise((resolve) => {
        this.activationQueue.push(async () => {
          const result = await this.performActivation(serviceId);
          resolve(result);
        });
      });
    }

    // 락 설정 및 활성화 수행
    this.activationLock = true;
    try {
      return await this.performActivation(serviceId);
    } finally {
      this.activationLock = false;
      
      // 대기 중인 활성화 요청 처리
      if (this.activationQueue.length > 0) {
        const nextActivation = this.activationQueue.shift();
        if (nextActivation) {
          this.activationLock = true;
          try {
            await nextActivation();
          } finally {
            this.activationLock = false;
          }
        }
      }
    }
  }

  // 실제 활성화 수행
  private async performActivation(serviceId: string): Promise<ServiceMessage[]> {
    const service = this.services.get(serviceId);
    
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    // 이미 활성화된 서비스라면 그대로 반환
    if (this.activeService === service) {
      return [{
        type: 'system',
        content: `${service.getConfig().name} 서비스가 이미 활성화되어 있습니다.`,
        metadata: {
          serviceId,
          timestamp: Date.now()
        }
      }];
    }

    // 기존 활성 서비스가 있으면 비활성화
    if (this.activeService) {
      await this.deactivateService();
    }

    // 새 서비스 활성화
    this.activeService = service;
    await service.initialize(this.context);
    service.activate();

    // 초기 메시지 반환
    return [
      {
        type: 'system',
        content: `${service.getConfig().name} 서비스가 활성화되었습니다.`,
        metadata: {
          serviceId,
          timestamp: Date.now()
        }
      }
    ];
  }

  // 서비스 비활성화
  async deactivateService(): Promise<void> {
    if (this.activeService) {
      await this.activeService.terminate();
      this.activeService.deactivate();
      this.activeService = null;
    }
  }

  // 현재 활성 서비스
  getActiveService(): BaseService | null {
    return this.activeService;
  }

  // 메시지 라우팅
  async handleMessage(message: string): Promise<ServiceMessage[]> {
    // 서비스 활성화 명령 체크
    const activationPattern = /^(@|\/service\s+)(\w+)/;
    const match = message.match(activationPattern);
    
    if (match) {
      const serviceId = match[2];
      if (this.services.has(serviceId)) {
        return this.activateService(serviceId);
      }
    }

    // 활성 서비스가 있으면 메시지 전달
    if (this.activeService) {
      return this.activeService.handleMessage(message);
    }

    // 활성 서비스가 없으면 서비스 추천
    return this.suggestServices(message);
  }

  // 액션 처리
  async handleAction(serviceId: string, actionId: string, data: any): Promise<ServiceMessage[]> {
    const service = this.services.get(serviceId);
    
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    // 서비스가 활성화되어 있지 않으면 활성화
    if (this.activeService !== service) {
      await this.activateService(serviceId);
    }

    return service.handleAction(actionId, data);
  }

  // 서비스 추천 (키워드 기반)
  private suggestServices(message: string): ServiceMessage[] {
    const suggestions: ServiceConfig[] = [];
    const keywords = message.toLowerCase().split(' ');

    // 각 서비스의 이름과 설명에서 키워드 매칭
    this.services.forEach(service => {
      const config = service.getConfig();
      if (!config.enabled) return;

      const searchText = `${config.name} ${config.description}`.toLowerCase();
      const matches = keywords.some(keyword => searchText.includes(keyword));
      
      if (matches) {
        suggestions.push(config);
      }
    });

    if (suggestions.length > 0) {
      return [{
        type: 'text',
        content: '관련 서비스를 찾았습니다. 원하시는 서비스를 선택해주세요.',
        metadata: {
          timestamp: Date.now()
        }
      }];
    }

    return [{
      type: 'text',
      content: '어떤 서비스를 이용하시겠습니까?',
      metadata: {
        timestamp: Date.now()
      }
    }];
  }

  // 컨텍스트 설정
  setContext(context: ServiceContext): void {
    this.context = { ...this.context, ...context };
    
    // 활성 서비스에도 컨텍스트 전달
    if (this.activeService) {
      this.activeService.setContext(context);
    }
  }

  // 모든 서비스 초기화
  async initializeAll(): Promise<void> {
    console.log('Initializing all services...');
    for (const service of this.services.values()) {
      await service.initialize(this.context);
    }
    console.log('All services initialized');
  }

  // 정리
  async cleanup(): Promise<void> {
    await this.deactivateService();
    this.services.clear();
    this.context = {};
  }
}

// 싱글톤 인스턴스
export const ServiceRegistry = new ServiceRegistryClass();

// 타입 export
export type { ServiceRegistryClass };