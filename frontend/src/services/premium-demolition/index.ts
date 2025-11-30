import React from 'react';
import { BaseService } from '../base/BaseService';
import { ServiceMessage, ServiceAction, ServiceContext } from '../base/types';
import QuoteForm from './components/QuoteForm';
import ServiceIntro from './components/ServiceIntro';

export class PremiumDemolitionService extends BaseService {
  constructor() {
    super({
      id: 'premium-demolition',
      name: '프리미엄철거',
      emoji: '🏗️',
      description: '안전하고 깨끗한 철거 서비스',
      version: '1.0.0',
      enabled: true
    });
  }

  async initialize(context: ServiceContext): Promise<void> {
    this.setContext(context);
    console.log('프리미엄철거 서비스 초기화');
  }

  async handleMessage(message: string): Promise<ServiceMessage[]> {
    const lowerMessage = message.toLowerCase();
    
    // 견적 관련
    if (lowerMessage.includes('견적') || lowerMessage.includes('가격') || lowerMessage.includes('비용')) {
      return [
        this.createTextMessage('견적을 도와드리겠습니다. 아래 정보를 입력해주세요.'),
        this.createComponentMessage(
          React.createElement(QuoteForm, {
            onSubmit: (data: any) => this.handleAction('submit-quote', data)
          })
        )
      ];
    }

    // 서비스 소개
    if (lowerMessage.includes('소개') || lowerMessage.includes('설명')) {
      return [
        this.createComponentMessage(
          React.createElement(ServiceIntro, {
            service: this.config
          })
        )
      ];
    }

    // 일정 관련
    if (lowerMessage.includes('일정') || lowerMessage.includes('언제')) {
      return [
        this.createTextMessage('철거 일정 상담을 도와드리겠습니다.'),
        this.createTextMessage('희망하시는 철거 시작일을 알려주세요.'),
        this.createSystemMessage('날짜 선택 컴포넌트를 표시합니다.')
      ];
    }

    // 기본 응답
    return [
      this.createTextMessage('프리미엄철거 서비스에 대해 무엇을 도와드릴까요?'),
      this.createTextMessage('견적, 일정, 서비스 소개 등을 요청하실 수 있습니다.')
    ];
  }

  async handleAction(actionId: string, data: any): Promise<ServiceMessage[]> {
    switch (actionId) {
      case 'submit-quote':
        this.setStateData('quoteData', data);
        return [
          this.createTextMessage('견적 요청이 접수되었습니다.'),
          this.createTextMessage(`입력하신 정보:
- 철거 유형: ${data.demolitionType}
- 면적: ${data.area}㎡
- 위치: ${data.location}
- 희망일: ${data.desiredDate}`),
          this.createTextMessage('담당자가 곧 연락드리겠습니다.')
        ];

      case 'show-portfolio':
        return [
          this.createTextMessage('프리미엄철거 시공 사례를 보여드리겠습니다.'),
          this.createSystemMessage('포트폴리오 갤러리 컴포넌트')
        ];

      case 'contact':
        return [
          this.createTextMessage('상담 예약을 도와드리겠습니다.'),
          this.createSystemMessage('연락처 입력 폼')
        ];

      default:
        return [
          this.createTextMessage('알 수 없는 액션입니다.')
        ];
    }
  }

  getAvailableActions(): ServiceAction[] {
    return [
      {
        id: 'get-quote',
        label: '견적 받기',
        icon: '💰',
        type: 'button',
        handler: async () => this.handleMessage('견적')
      },
      {
        id: 'show-portfolio',
        label: '시공 사례',
        icon: '📸',
        type: 'button',
        handler: async () => this.handleAction('show-portfolio', {})
      },
      {
        id: 'schedule',
        label: '일정 상담',
        icon: '📅',
        type: 'button',
        handler: async () => this.handleMessage('일정')
      },
      {
        id: 'contact',
        label: '전화 상담',
        icon: '📞',
        type: 'button',
        handler: async () => this.handleAction('contact', {})
      }
    ];
  }

  async terminate(): Promise<void> {
    console.log('프리미엄철거 서비스 종료');
    this.clearHistory();
  }
}