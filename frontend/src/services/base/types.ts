import { ReactElement } from 'react';

export interface ServiceConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  version: string;
  enabled: boolean;
}

export type MessageType = 'text' | 'component' | 'action' | 'system';

export interface ServiceMessage {
  type: MessageType;
  content?: string;
  component?: ReactElement;
  props?: any;
  metadata?: {
    timestamp?: number;
    serviceId?: string;
    actionId?: string;
  };
}

export interface ServiceAction {
  id: string;
  label: string;
  icon?: string;
  type: 'button' | 'form' | 'select' | 'custom';
  handler?: (data: any) => Promise<ServiceMessage[]>;
}

export interface ServiceContext {
  userId?: string;
  projectId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface ServiceState {
  isActive: boolean;
  currentStep?: string;
  data?: Record<string, any>;
  history?: ServiceMessage[];
}