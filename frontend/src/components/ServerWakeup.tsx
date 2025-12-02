'use client';

import { useEffect } from 'react';
import { wakeUpServer } from '@/lib/serverWakeup';

export default function ServerWakeup() {
  useEffect(() => {
    // 앱 로드 시 서버 깨우기 (백그라운드에서 실행)
    wakeUpServer();
    
    // 10분마다 서버 깨우기 (sleep 방지)
    const interval = setInterval(() => {
      wakeUpServer();
    }, 10 * 60 * 1000); // 10분
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
}