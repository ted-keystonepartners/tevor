import { 
  ServiceConfig, 
  ServiceMessage, 
  ServiceAction, 
  ServiceContext,
  ServiceState 
} from './types';

export abstract class BaseService {
  protected config: ServiceConfig;
  protected context: ServiceContext;
  protected state: ServiceState;
  
  // 히스토리 크기 제한 상수
  private readonly MAX_HISTORY_SIZE = 100;
  private readonly HISTORY_CLEANUP_THRESHOLD = 120;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.context = {};
    this.state = {
      isActive: false,
      data: {},
      history: []
    };
  }

  // 서비스 초기화
  abstract initialize(context: ServiceContext): Promise<void>;
  
  // 메시지 처리
  abstract handleMessage(message: string): Promise<ServiceMessage[]>;
  
  // 액션 처리
  abstract handleAction(actionId: string, data: any): Promise<ServiceMessage[]>;
  
  // 사용 가능한 액션 목록
  abstract getAvailableActions(): ServiceAction[];

  // 서비스 종료
  abstract terminate(): Promise<void>;

  // 공통 메서드들
  getConfig(): ServiceConfig {
    return this.config;
  }

  getState(): ServiceState {
    return this.state;
  }

  setContext(context: ServiceContext): void {
    this.context = { ...this.context, ...context };
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  activate(): void {
    this.state.isActive = true;
  }

  deactivate(): void {
    this.state.isActive = false;
  }

  // 히스토리 관리 - 메모리 누수 방지
  addToHistory(message: ServiceMessage): void {
    if (!this.state.history) {
      this.state.history = [];
    }
    
    this.state.history.push({
      ...message,
      metadata: {
        ...message.metadata,
        timestamp: Date.now(),
        serviceId: this.config.id
      }
    });
    
    // 히스토리 크기 관리
    if (this.state.history.length > this.HISTORY_CLEANUP_THRESHOLD) {
      // 임계값 초과 시 최근 MAX_HISTORY_SIZE 개만 유지
      console.log(`[${this.config.id}] Cleaning up history: ${this.state.history.length} -> ${this.MAX_HISTORY_SIZE}`);
      this.state.history = this.state.history.slice(-this.MAX_HISTORY_SIZE);
    }
  }

  clearHistory(): void {
    this.state.history = [];
  }

  // 상태 데이터 관리
  setStateData(key: string, value: any): void {
    if (!this.state.data) {
      this.state.data = {};
    }
    this.state.data[key] = value;
  }

  getStateData(key: string): any {
    return this.state.data?.[key];
  }

  // 유틸리티 메서드
  protected createTextMessage(content: string): ServiceMessage {
    return {
      type: 'text',
      content,
      metadata: {
        serviceId: this.config.id,
        timestamp: Date.now()
      }
    };
  }

  protected createComponentMessage(component: React.ReactElement, props?: any): ServiceMessage {
    return {
      type: 'component',
      component,
      props,
      metadata: {
        serviceId: this.config.id,
        timestamp: Date.now()
      }
    };
  }

  protected createSystemMessage(content: string): ServiceMessage {
    return {
      type: 'system',
      content,
      metadata: {
        serviceId: this.config.id,
        timestamp: Date.now()
      }
    };
  }
}