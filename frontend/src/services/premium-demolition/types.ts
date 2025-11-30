// 프리미엄철거 서비스 타입 정의

export interface DemolitionData {
  photos?: File[];
  address?: string;
  addressDetail?: string;
  desiredDate?: string;
  wasteDisposal?: boolean;
  area?: number;
  hasElevator?: boolean;
}

export type DemolitionStep = 
  | 'welcome'
  | 'photo_upload'
  | 'address_input'
  | 'date_select'
  | 'waste_disposal'
  | 'area_input'
  | 'elevator_check'
  | 'summary'
  | 'complete';

export interface StepConfig {
  step: DemolitionStep;
  title: string;
  description: string;
}