import React from 'react';
import { BaseService } from '../base/BaseService';
import { ServiceMessage, ServiceAction, ServiceContext } from '../base/types';
import { DemolitionStep, DemolitionData } from './types';

// 컴포넌트 import
import PhotoUpload from '../../components/chat-ui/PhotoUpload';
import AddressInput from '../../components/chat-ui/AddressInput';
import DatePicker from '../../components/chat-ui/DatePicker';
import SelectOptions from '../../components/chat-ui/SelectOptions';
import NumberInput from '../../components/chat-ui/NumberInput';
import ServiceSummary from './components/ServiceSummary';

export class PremiumDemolitionService extends BaseService {
  private currentStep: DemolitionStep = 'welcome';
  private demolitionData: DemolitionData = {};

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
    this.currentStep = 'welcome';
    this.demolitionData = {};
    console.log('프리미엄철거 서비스 초기화');
  }

  async handleMessage(message: string): Promise<ServiceMessage[]> {
    // 서비스 시작 또는 초기 상태
    if (message === 'start' || this.currentStep === 'welcome') {
      this.currentStep = 'photo_upload';
      // 메시지만 먼저 반환 (컴포넌트는 나중에 별도로)
      return [
        this.createTextMessage(
          '프리미엄철거 서비스를 이용하기 위해 🏗️\n\n' +
          '견적을 위한 몇 가지 정보가 필요합니다.\n' +
          '단계별로 안내해드리겠습니다.\n\n' +
          '먼저 철거가 필요한 현장의 사진을 올려주세요.'
        )
      ];
    }
    
    // 사진 업로드 컴포넌트 요청
    if (message === 'show_photo_upload' && this.currentStep === 'photo_upload') {
      return [
        this.createComponentMessage(
          React.createElement(PhotoUpload, {
            onUpload: (files: File[]) => this.handlePhotoUpload(files),
            onSkip: () => this.handlePhotoSkip()
          })
        )
      ];
    }

    // 기본 응답
    return [
      this.createTextMessage('프리미엄철거 서비스 진행 중입니다.')
    ];
  }

  async handleAction(actionId: string, data: any): Promise<ServiceMessage[]> {
    switch (actionId) {
      case 'photo_upload':
        return this.handlePhotoUpload(data);
      case 'photo_skip':
        return this.handlePhotoSkip();
      case 'address_submit':
        return this.handleAddressSubmit(data.address, data.detail);
      case 'date_select':
        return this.handleDateSelect(data);
      case 'waste_disposal':
        return this.handleWasteDisposal(data);
      case 'area_input':
        return this.handleAreaInput(data);
      case 'elevator_check':
        return this.handleElevatorCheck(data);
      case 'confirm_application':
        return this.handleConfirmation();
      default:
        return [this.createTextMessage('알 수 없는 액션입니다.')];
    }
  }

  // 사진 업로드 처리
  private async handlePhotoUpload(files: File[]): Promise<ServiceMessage[]> {
    this.demolitionData.photos = files;
    this.currentStep = 'address_input';
    
    return [
      this.createTextMessage(`사진 ${files.length}장을 받았습니다. 감사합니다! 📸`),
      this.createTextMessage('이제 철거 현장의 주소를 알려주세요.'),
      this.createComponentMessage(
        React.createElement(AddressInput, {
          onSubmit: (address: string, detail: string) => 
            this.handleAction('address_submit', { address, detail })
        })
      )
    ];
  }

  // 사진 건너뛰기
  private async handlePhotoSkip(): Promise<ServiceMessage[]> {
    this.currentStep = 'address_input';
    
    return [
      this.createTextMessage('사진은 나중에 추가하실 수 있습니다.'),
      this.createTextMessage('철거 현장의 주소를 알려주세요.'),
      this.createComponentMessage(
        React.createElement(AddressInput, {
          onSubmit: (address: string, detail: string) => 
            this.handleAction('address_submit', { address, detail })
        })
      )
    ];
  }

  // 주소 입력 처리
  private async handleAddressSubmit(address: string, detail: string): Promise<ServiceMessage[]> {
    this.demolitionData.address = address;
    this.demolitionData.addressDetail = detail;
    this.currentStep = 'date_select';

    return [
      this.createTextMessage(`주소: ${address} ${detail ? detail : ''}`),
      this.createTextMessage('언제부터 시공을 시작하면 좋을까요?'),
      this.createComponentMessage(
        React.createElement(DatePicker, {
          onSelect: (date: string) => this.handleAction('date_select', date),
          label: '시공 희망일'
        })
      )
    ];
  }

  // 날짜 선택 처리
  private async handleDateSelect(date: string): Promise<ServiceMessage[]> {
    this.demolitionData.desiredDate = date;
    this.currentStep = 'waste_disposal';

    return [
      this.createTextMessage(`${new Date(date).toLocaleDateString('ko-KR')}로 선택하셨습니다.`),
      this.createTextMessage('철거 후 폐기물 처리도 함께 진행하시겠습니까?'),
      this.createComponentMessage(
        React.createElement(SelectOptions, {
          title: '폐기물 처리',
          description: '철거 후 발생한 폐기물을 당사에서 처리해드립니다',
          options: [
            { id: 'yes', label: '네, 폐기물 처리도 포함해주세요', icon: '✅' },
            { id: 'no', label: '아니요, 직접 처리하겠습니다', icon: '❌' }
          ],
          onSelect: (selected: string) => 
            this.handleAction('waste_disposal', selected === 'yes')
        })
      )
    ];
  }

  // 폐기물 처리 선택
  private async handleWasteDisposal(includeWaste: boolean): Promise<ServiceMessage[]> {
    this.demolitionData.wasteDisposal = includeWaste;
    this.currentStep = 'area_input';

    return [
      this.createTextMessage(includeWaste ? 
        '폐기물 처리를 포함하여 진행하겠습니다.' : 
        '폐기물은 고객님께서 직접 처리하시는 것으로 진행하겠습니다.'),
      this.createTextMessage('철거할 공간의 면적은 몇 평인가요?'),
      this.createComponentMessage(
        React.createElement(NumberInput, {
          title: '철거 면적',
          description: '대략적인 평수를 입력해주세요',
          unit: '평',
          min: 1,
          max: 500,
          onSubmit: (value: number) => this.handleAction('area_input', value)
        })
      )
    ];
  }

  // 면적 입력
  private async handleAreaInput(area: number): Promise<ServiceMessage[]> {
    this.demolitionData.area = area;
    this.currentStep = 'elevator_check';

    return [
      this.createTextMessage(`${area}평으로 입력하셨습니다.`),
      this.createTextMessage('마지막으로, 현장에 엘리베이터가 있나요?'),
      this.createComponentMessage(
        React.createElement(SelectOptions, {
          title: '엘리베이터 유무',
          description: '자재 운반과 작업 효율성에 영향을 미칩니다',
          options: [
            { id: 'yes', label: '엘리베이터 있음', icon: '🛗' },
            { id: 'no', label: '엘리베이터 없음 (계단 이용)', icon: '🪜' }
          ],
          onSelect: (selected: string) => 
            this.handleAction('elevator_check', selected === 'yes')
        })
      )
    ];
  }

  // 엘리베이터 확인
  private async handleElevatorCheck(hasElevator: boolean): Promise<ServiceMessage[]> {
    this.demolitionData.hasElevator = hasElevator;
    this.currentStep = 'summary';

    return [
      this.createTextMessage('모든 정보를 입력해주셔서 감사합니다!'),
      this.createTextMessage('입력하신 내용을 확인해주세요.'),
      this.createComponentMessage(
        React.createElement(ServiceSummary, {
          data: this.demolitionData,
          onConfirm: () => this.handleAction('confirm_application', {})
        })
      )
    ];
  }

  // 최종 확인
  private async handleConfirmation(): Promise<ServiceMessage[]> {
    this.currentStep = 'complete';
    
    // 신청 번호 생성
    const applicationId = '#PD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // 실제로는 여기서 백엔드로 데이터 전송
    console.log('프리미엄철거 신청 데이터:', this.demolitionData);

    // 서비스 데이터를 메타데이터에 저장 (나중에 Gemini가 참조할 수 있도록)
    const summaryMetadata = {
      serviceId: this.config.id,
      applicationId,
      demolitionData: this.demolitionData,
      summary: this.generateSummary(applicationId)
    };

    return [
      this.createTextMessage('🎉 신청이 완료되었습니다!'),
      this.createTextMessage(`접수번호: ${applicationId}`),
      this.createTextMessage('24시간 이내에 담당자가 연락드리겠습니다.'),
      {
        type: 'text',
        content: '추가 문의사항이 있으시면 언제든 말씀해주세요.',
        metadata: summaryMetadata  // 마지막 메시지에 전체 요약 데이터 첨부
      }
    ];
  }

  getAvailableActions(): ServiceAction[] {
    return [
      {
        id: 'restart',
        label: '처음부터 다시',
        icon: '🔄',
        type: 'button',
        handler: async () => {
          this.currentStep = 'welcome';
          this.demolitionData = {};
          return this.handleMessage('start');
        }
      }
    ];
  }

  // 서비스 요약 생성
  private generateSummary(applicationId?: string): string {
    const data = this.demolitionData;
    let summary = `[프리미엄철거 서비스 요약]\n`;
    
    if (applicationId) {
      summary += `접수번호: ${applicationId}\n`;
    }
    
    if (data.address) {
      summary += `주소: ${data.address} ${data.addressDetail || ''}\n`;
    }
    
    if (data.desiredDate) {
      summary += `희망일: ${new Date(data.desiredDate).toLocaleDateString('ko-KR')}\n`;
    }
    
    if (data.area) {
      summary += `면적: ${data.area}평\n`;
    }
    
    if (data.wasteDisposal !== undefined) {
      summary += `폐기물 처리: ${data.wasteDisposal ? '포함' : '미포함'}\n`;
    }
    
    if (data.hasElevator !== undefined) {
      summary += `엘리베이터: ${data.hasElevator ? '있음' : '없음'}\n`;
    }
    
    if (data.photos && data.photos.length > 0) {
      summary += `첫부 사진: ${data.photos.length}장\n`;
    }
    
    // 예상 비용 계산 (예시)
    if (data.area) {
      const estimatedCost = data.area * 150000; // 평당 15만원 가정
      summary += `예상 비용: ${estimatedCost.toLocaleString('ko-KR')}원 (참고용)`;
    }
    
    return summary;
  }

  async terminate(): Promise<void> {
    console.log('프리미엄철거 서비스 종료');
    
    // 서비스 종료 시 요약 생성
    if (this.currentStep === 'complete' && Object.keys(this.demolitionData).length > 0) {
      const finalSummary = this.generateSummary();
      console.log('서비스 종료 요약:', finalSummary);
    }
    
    this.currentStep = 'welcome';
    this.demolitionData = {};
    this.clearHistory();
  }
}