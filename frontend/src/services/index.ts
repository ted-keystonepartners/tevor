// 서비스 레지스트리와 서비스들을 중앙에서 관리
import { ServiceRegistry } from './registry/ServiceRegistry';
import { PremiumDemolitionService } from './premium-demolition';

// 서비스 초기화 함수
export const initializeServices = async () => {
  // 이미 초기화되었으면 스킵
  if (ServiceRegistry.getIsInitialized()) {
    return;
  }
  
  console.log('Initializing TEVOR Services...');
  
  // 서비스 등록
  ServiceRegistry.register(new PremiumDemolitionService());
  
  // TODO: 다른 서비스들 추가
  // ServiceRegistry.register(new SitePhotoService());
  // ServiceRegistry.register(new AIStylingService());
  // ServiceRegistry.register(new PaymentAgencyService());
  // ServiceRegistry.register(new ASCenterService());
  
  // 초기화 완료 표시
  ServiceRegistry.setIsInitialized(true);
  
  console.log('Services registered:', ServiceRegistry.list());
};

// Export
export { ServiceRegistry };
export * from './base/types';