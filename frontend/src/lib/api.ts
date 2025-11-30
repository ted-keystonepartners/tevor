import axios, { AxiosResponse } from 'axios';
import {
  Project,
  ProjectCreate,
  ChatRequest,
  ChatResponse,
  ApiResponse,
} from './types';

// API 클라이언트 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60초로 증가
  headers: {
    'Content-Type': 'application/json',
  },
});

// 공통 에러 핸들러
const errorHandler = (error: any) => {
    console.group('🚨 API Error Details');
    console.error('Error Object:', error);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method?.toUpperCase());
    console.error('Status Code:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.groupEnd();
    
    if (error.response?.status === 404) {
      throw new Error('요청한 리소스를 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      const serverError = error.response?.data?.detail || '서버에서 오류가 발생했습니다.';
      console.error('🔥 Server Error Detail:', serverError);
      throw new Error(`서버 오류: ${serverError}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('요청 시간이 초과되었습니다.');
    } else if (error.message === 'Network Error') {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    
    throw error;
};

// 인터셉터 설정
apiClient.interceptors.response.use(
  (response) => response,
  errorHandler
);

// API 클래스
class TevorAPI {
  // 헬스체크 API
  async healthCheck(): Promise<any> {
    const response = await apiClient.get('/health');
    return response.data;
  }

  // 프로젝트 관련 API
  async createProject(data: ProjectCreate): Promise<Project> {
    const response: AxiosResponse<Project> = await apiClient.post('/api/v1/projects/', data);
    return response.data;
  }

  async getProject(projectId: string): Promise<Project> {
    const response: AxiosResponse<Project> = await apiClient.get(`/api/v1/projects/${projectId}`);
    return response.data;
  }

  async listProjects(): Promise<Project[]> {
    const response: AxiosResponse<Project[]> = await apiClient.get('/api/v1/projects/');
    return response.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/api/v1/projects/${projectId}`);
  }

  async getProjectSummary(projectId: string) {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/summary`);
    return response.data;
  }

  // 채팅 관련 API - v2 엔드포인트 사용
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    const response: AxiosResponse<ChatResponse> = await apiClient.post('/api/v2/chat/message', data);
    return response.data;
  }

  // 스트리밍 채팅 API
  async sendMessageStream(
    data: ChatRequest,
    onChunk: (text: string) => void,
    onComplete?: (messageId?: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v2/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // 마지막 줄이 불완전할 수 있으므로 보관
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim()) {
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'content' && parsed.text) {
                  onChunk(parsed.text);
                } else if (parsed.type === 'end') {
                  onComplete?.(parsed.message_id);
                  return; // 정상 종료
                } else if (parsed.type === 'error' && parsed.error) {
                  // 명시적인 에러만 처리 (빈 에러는 무시)
                  if (parsed.error && parsed.error.trim()) {
                    console.warn('Stream error:', parsed.error);
                    // onError는 호출하지 않음 (응답은 이미 받았으므로)
                  }
                  // return 제거 - 계속 진행
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e, 'Line:', line);
                // 파싱 에러는 무시하고 계속
              }
            }
          }
        }
      }
      
      // 스트림이 끝났는데 end 이벤트가 없으면 완료 처리
      onComplete?.();
      
    } catch (error) {
      console.error('Stream error details:', error);
      onError?.(error instanceof Error ? error.message : 'Stream error');
    }
  }

  async getChatHistory(projectId: string, skip: number = 0, limit: number = 50) {
    const response = await apiClient.get(`/api/v2/chat/history/${projectId}`, {
      params: { skip, limit }
    });
    return response.data;
  }
}

// API 인스턴스 export
export const api = new TevorAPI();

// 유틸리티 함수들
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
};

export const getConfidenceBadgeColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'bg-green-100 text-green-800';
  if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};