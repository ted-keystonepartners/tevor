# TEVOR 서비스 아키텍처 설계

## 🎯 목표
- 각 서비스를 독립적인 모듈로 관리
- 채팅 인터페이스 내에서 모든 인터랙션 처리
- 재사용 가능한 UI 컴포넌트 라이브러리
- 확장 가능한 서비스 플러그인 시스템

## 📁 프로젝트 구조

```
frontend/src/
├── services/                    # 서비스 모듈
│   ├── registry.ts              # 서비스 레지스트리
│   ├── base/                    # 베이스 서비스 클래스
│   │   └── BaseService.ts
│   ├── premium-demolition/      # 프리미엄철거
│   │   ├── index.ts
│   │   ├── components/
│   │   ├── handlers/
│   │   └── types.ts
│   ├── site-photo/              # 현장사진기록
│   │   ├── index.ts
│   │   ├── components/
│   │   ├── handlers/
│   │   └── types.ts
│   ├── ai-styling/              # AI스타일링
│   │   ├── index.ts
│   │   ├── components/
│   │   ├── handlers/
│   │   └── types.ts
│   ├── payment-agency/          # 결제대행서비스
│   │   ├── index.ts
│   │   ├── components/
│   │   ├── handlers/
│   │   └── types.ts
│   └── as-center/               # AS센터
│       ├── index.ts
│       ├── components/
│       ├── handlers/
│       └── types.ts
│
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatBubble.tsx
│   │   └── ChatServiceButtons.tsx
│   └── chat-ui/                 # 채팅 UI 컴포넌트 라이브러리
│       ├── buttons/
│       │   ├── ActionButton.tsx
│       │   ├── OptionButton.tsx
│       │   └── QuickReplyButton.tsx
│       ├── cards/
│       │   ├── InfoCard.tsx
│       │   ├── ServiceCard.tsx
│       │   └── ProductCard.tsx
│       ├── forms/
│       │   ├── InputForm.tsx
│       │   ├── SelectForm.tsx
│       │   └── DatePickerForm.tsx
│       ├── payment/
│       │   ├── PaymentCard.tsx
│       │   ├── PriceCalculator.tsx
│       │   └── CheckoutForm.tsx
│       ├── media/
│       │   ├── ImageGallery.tsx
│       │   ├── ImageUploader.tsx
│       │   └── VideoPlayer.tsx
│       └── feedback/
│           ├── ProgressBar.tsx
│           ├── StatusBadge.tsx
│           └── NotificationCard.tsx

```

## 🏗️ 서비스 아키텍처

### 1. BaseService 클래스
```typescript
interface ServiceConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  version: string;
}

interface ServiceMessage {
  type: 'text' | 'component' | 'action';
  content?: string;
  component?: React.ComponentType<any>;
  props?: any;
}

abstract class BaseService {
  config: ServiceConfig;
  
  abstract initialize(): Promise<void>;
  abstract handleMessage(message: string): Promise<ServiceMessage[]>;
  abstract handleAction(actionId: string, data: any): Promise<ServiceMessage[]>;
  abstract getAvailableActions(): Action[];
}
```

### 2. 서비스 레지스트리
```typescript
class ServiceRegistry {
  private services: Map<string, BaseService>;
  
  register(service: BaseService): void;
  get(serviceId: string): BaseService;
  list(): ServiceConfig[];
  handleServiceRequest(serviceId: string, message: string): Promise<ServiceMessage[]>;
}
```

## 📦 각 서비스 구현 예시

### 프리미엄철거 서비스
```typescript
// services/premium-demolition/index.ts
class PremiumDemolitionService extends BaseService {
  config = {
    id: 'premium-demolition',
    name: '프리미엄철거',
    emoji: '🏗️',
    description: '안전하고 깨끗한 철거 서비스',
    version: '1.0.0'
  };

  async handleMessage(message: string) {
    // 메시지 분석 및 적절한 응답 생성
    if (message.includes('견적')) {
      return [{
        type: 'component',
        component: QuoteCalculator,
        props: { serviceType: 'demolition' }
      }];
    }
    // ... 다른 케이스들
  }
}
```

## 🎨 채팅 UI 컴포넌트 라이브러리

### 1. 버튼 컴포넌트
- **ActionButton**: 주요 액션 실행 (예: 신청하기, 결제하기)
- **OptionButton**: 선택 옵션 제공 (예: 서비스 선택)
- **QuickReplyButton**: 빠른 답변 버튼

### 2. 카드 컴포넌트
- **InfoCard**: 정보 표시용 카드
- **ServiceCard**: 서비스 상세 정보
- **ProductCard**: 상품/옵션 선택 카드

### 3. 폼 컴포넌트
- **InputForm**: 텍스트 입력
- **SelectForm**: 드롭다운 선택
- **DatePickerForm**: 날짜 선택

### 4. 결제 컴포넌트
- **PaymentCard**: 결제 정보 표시
- **PriceCalculator**: 가격 계산기
- **CheckoutForm**: 결제 진행 폼

## 🔄 인터랙션 플로우

1. 사용자가 서비스 버튼 클릭
2. ServiceRegistry가 해당 서비스 활성화
3. 서비스가 초기 메시지/컴포넌트 반환
4. ChatInterface가 컴포넌트 렌더링
5. 사용자 인터랙션 → 서비스 핸들러 → 새로운 컴포넌트
6. 전체 과정이 채팅 내에서 진행

## 🚀 구현 우선순위

1. **Phase 1: 기반 구조**
   - BaseService 클래스
   - ServiceRegistry
   - 기본 UI 컴포넌트 (버튼, 카드)

2. **Phase 2: 핵심 서비스**
   - 프리미엄철거 서비스
   - 현장사진기록 서비스

3. **Phase 3: 고급 기능**
   - AI스타일링 서비스
   - 결제대행서비스
   - AS센터

4. **Phase 4: 확장**
   - MCP 연동
   - 외부 API 통합
   - 서비스 플러그인 마켓플레이스

## 💡 특징

- **모듈화**: 각 서비스는 독립적으로 개발/배포 가능
- **재사용성**: UI 컴포넌트는 모든 서비스에서 공유
- **확장성**: 새 서비스 추가가 간단함
- **일관성**: 모든 서비스가 동일한 인터페이스 사용
- **사용자 경험**: 채팅 내에서 모든 작업 완료