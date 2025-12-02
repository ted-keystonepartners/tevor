// Render 서버 wake up 유틸리티
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function wakeUpServer(): Promise<boolean> {
  try {
    console.log('🔄 서버 상태 확인 중...');
    
    // health endpoint로 서버 깨우기 (timeout 짧게 설정)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 timeout
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ 서버가 활성화되었습니다');
      return true;
    }
    
    console.log('⚠️ 서버 응답 대기 중...');
    return false;
  } catch (error) {
    console.log('🔄 서버가 시작 중입니다. 잠시만 기다려주세요...');
    return false;
  }
}

export async function ensureServerReady(maxAttempts = 3): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const isReady = await wakeUpServer();
    
    if (isReady) {
      return true;
    }
    
    if (attempt < maxAttempts - 1) {
      const delay = (attempt + 1) * 2000; // 2초, 4초
      console.log(`${delay / 1000}초 후 다시 시도합니다...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
}