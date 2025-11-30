// Chat Mode
export enum ChatMode {
  AI = 'ai',           // Gemini 대화 모드
  SERVICE = 'service', // 서비스 실행 모드
  TRANSITION = 'transition' // 전환 중
}

// 프로젝트 관련 타입
export interface Project {
  project_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  address?: string;
  source?: string; // 접수경로
  file_count?: number;
  photo_count?: number;
  message_count?: number;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

// 채팅 관련 타입
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  confidence?: number;
  rag_context?: any;
  isNewMessage?: boolean; // 새로운 메시지인지 구분하기 위한 플래그
  // GPT-style 스트리밍 관련 필드
  isTyping?: boolean; // 타이핑 애니메이션 표시용
  isPlaceholder?: boolean; // 플레이스홀더 메시지인지 여부
  isStreaming?: boolean; // 스트리밍 중인지 여부
  // 메타데이터 - 컨텍스트 추적용
  metadata?: {
    source?: 'user' | 'gemini' | 'service';
    serviceId?: string;
    serviceData?: any;
    isServiceComponent?: boolean;
    summary?: string;
  };
}

export interface ChatRequest {
  project_id: string;
  message: string;
  conversation_history?: Array<{
    role: string;
    content: string;
    metadata?: any;
  }>;
}

export interface ChatResponse {
  id: number;
  message_id: string;
  response: string;
  confidence?: number;
  rag_context?: any;
  created_at: string;
  model_info?: {
    model_name: string;
    provider: string;
    quick_response?: boolean;
  };
}


// 타임라인 관련 타입
export interface TimelineEvent {
  id: string;
  type: 'message';
  timestamp: string;
  data: ChatMessage;
}


// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// UI 상태 타입
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
}


// 앱 전체 상태 타입
export interface AppState {
  // 프로젝트 상태
  currentProject: Project | null;
  projects: Project[];
  
  // 채팅 상태
  messages: ChatMessage[];
  isTyping: boolean;
  
  // 타임라인 상태
  timeline: TimelineEvent[];
  
  // UI 상태
  loading: LoadingState;
  error: ErrorState;
}

// 컴포넌트 Props 타입
export interface ChatInterfaceProps {
  projectId: string;
}

export interface ChatBubbleProps {
  message: ChatMessage;
  isLoading?: boolean;
}

export interface InputAreaProps {
  onSendMessage: (message: string) => void;
  onUploadFile?: (file: File, message?: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface TimelineCardProps {
  event: TimelineEvent;
  onClick?: () => void;
}

export interface TimelinePanelProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

export interface ProjectSelectorProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onCreateProject: (name: string, description?: string) => void;
  isLoading?: boolean;
}

// 상수 타입
export const MESSAGE_TYPES = {
  USER: 'user' as const,
  ASSISTANT: 'assistant' as const,
} as const;

export const TIMELINE_EVENT_TYPES = {
  MESSAGE: 'message' as const,
} as const;

export const CONFIDENCE_LEVELS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
  LOW: 0.3,
} as const;

// 유틸리티 타입
export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];
export type TimelineEventType = typeof TIMELINE_EVENT_TYPES[keyof typeof TIMELINE_EVENT_TYPES];
export type ConfidenceLevel = 'high' | 'medium' | 'low';