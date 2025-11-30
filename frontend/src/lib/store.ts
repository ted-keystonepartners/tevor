import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  AppState, 
  Project, 
  ChatMessage, 
  TimelineEvent, 
  LoadingState, 
  ErrorState 
} from './types';

interface AppActions {
  // 프로젝트 액션
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  
  // 채팅 액션
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage> | ((msg: ChatMessage) => ChatMessage)) => void;
  removeMessage: (messageId: string) => void;
  clearMessages: () => void;
  setIsTyping: (isTyping: boolean) => void;
  
  // 타임라인 액션
  setTimeline: (events: TimelineEvent[]) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  removeTimelineEvent: (eventId: string) => void;
  clearTimeline: () => void;
  
  // UI 상태 액션
  setLoading: (loading: Partial<LoadingState>) => void;
  setError: (error: Partial<ErrorState>) => void;
  clearError: () => void;
  
  
  // 전체 리셋
  reset: () => void;
}

type AppStore = AppState & AppActions;

// 초기 상태
const initialState: AppState = {
  // 프로젝트 상태
  currentProject: null,
  projects: [],
  
  // 채팅 상태
  messages: [],
  isTyping: false,
  
  // 타임라인 상태
  timeline: [],
  
  // UI 상태
  loading: {
    isLoading: false,
  },
  error: {
    hasError: false,
  },
};

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // 프로젝트 액션
      setCurrentProject: (project) => set({ currentProject: project }, false, 'setCurrentProject'),
      
      setProjects: (projects) => set({ projects }, false, 'setProjects'),
      
      addProject: (project) => set(
        (state) => {
          // 중복 방지: 같은 project_id가 이미 있으면 추가하지 않음
          const existingProject = state.projects.find(p => p.project_id === project.project_id);
          if (existingProject) {
            return state; // 중복이면 상태 변경 없음
          }
          
          return { 
            projects: [project, ...state.projects] 
          };
        }, 
        false, 
        'addProject'
      ),
      
      removeProject: (projectId) => set(
        (state) => ({
          projects: state.projects.filter(p => p.project_id !== projectId),
          currentProject: state.currentProject?.project_id === projectId ? null : state.currentProject,
        }),
        false,
        'removeProject'
      ),
      
      // 채팅 액션
      setMessages: (messages) => set({ messages }, false, 'setMessages'),
      
      addMessage: (message) => set(
        (state) => ({ 
          messages: [...state.messages, message] 
        }), 
        false, 
        'addMessage'
      ),
      
      updateMessage: (messageId, updates) => set(
        (state) => ({
          messages: state.messages.map(msg => {
            if (msg.id === messageId) {
              return typeof updates === 'function' 
                ? updates(msg)
                : { ...msg, ...updates };
            }
            return msg;
          })
        }),
        false,
        'updateMessage'
      ),
      
      removeMessage: (messageId) => set(
        (state) => ({
          messages: state.messages.filter(msg => msg.id !== messageId)
        }),
        false,
        'removeMessage'
      ),
      
      clearMessages: () => set({ messages: [] }, false, 'clearMessages'),
      
      setIsTyping: (isTyping) => set({ isTyping }, false, 'setIsTyping'),
      
      // 타임라인 액션
      setTimeline: (timeline) => set({ timeline }, false, 'setTimeline'),
      
      addTimelineEvent: (event) => set(
        (state) => {
          // 중복 방지: 같은 ID가 이미 있으면 추가하지 않음
          const existingEvent = state.timeline.find(e => e.id === event.id);
          if (existingEvent) {
            return state; // 중복이면 상태 변경 없음
          }
          
          return {
            timeline: [...state.timeline, event].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
          };
        },
        false,
        'addTimelineEvent'
      ),
      
      removeTimelineEvent: (eventId) => set(
        (state) => ({
          timeline: state.timeline.filter(event => event.id !== eventId)
        }),
        false,
        'removeTimelineEvent'
      ),
      
      clearTimeline: () => set({ timeline: [] }, false, 'clearTimeline'),
      
      // UI 상태 액션
      setLoading: (loading) => set(
        (state) => ({
          loading: { ...state.loading, ...loading }
        }),
        false,
        'setLoading'
      ),
      
      setError: (error) => set(
        (state) => ({
          error: { ...state.error, ...error }
        }),
        false,
        'setError'
      ),
      
      clearError: () => set({ error: { hasError: false } }, false, 'clearError'),
      
      // 전체 리셋
      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'tevor-store',
    }
  )
);

// 선택자 훅스 (성능 최적화)
export const useCurrentProject = () => useAppStore(state => state.currentProject);
export const useProjects = () => useAppStore(state => state.projects);
export const useMessages = () => useAppStore(state => state.messages);
export const useIsTyping = () => useAppStore(state => state.isTyping);
export const useTimeline = () => useAppStore(state => state.timeline);
export const useLoading = () => useAppStore(state => state.loading);
export const useError = () => useAppStore(state => state.error);

// 액션 선택자
export const useProjectActions = () => useAppStore(state => ({
  setCurrentProject: state.setCurrentProject,
  setProjects: state.setProjects,
  addProject: state.addProject,
  removeProject: state.removeProject,
}));

export const useChatActions = () => useAppStore(state => ({
  setMessages: state.setMessages,
  addMessage: state.addMessage,
  updateMessage: state.updateMessage,
  removeMessage: state.removeMessage,
  clearMessages: state.clearMessages,
  setIsTyping: state.setIsTyping,
}));

export const useTimelineActions = () => useAppStore(state => ({
  setTimeline: state.setTimeline,
  addTimelineEvent: state.addTimelineEvent,
  removeTimelineEvent: state.removeTimelineEvent,
  clearTimeline: state.clearTimeline,
}));

export const useUIActions = () => useAppStore(state => ({
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
  reset: state.reset,
}));

// 복합 선택자 (여러 상태 조합)
export const useChatState = () => useAppStore(state => ({
  messages: state.messages,
  isTyping: state.isTyping,
  loading: state.loading,
  error: state.error,
}));

export const useProjectState = () => useAppStore(state => ({
  currentProject: state.currentProject,
  projects: state.projects,
  loading: state.loading,
  error: state.error,
}));


