'use client';

import { X, Circle } from 'lucide-react';

interface ServiceStatusIndicatorProps {
  serviceId: string | null;
  serviceName?: string;
  serviceEmoji?: string;
  onStop: () => void;
}

export default function ServiceStatusIndicator({ 
  serviceId, 
  onStop 
}: ServiceStatusIndicatorProps) {
  if (!serviceId) return null;
  
  return (
    <button
      onClick={onStop}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
      title="서비스 종료"
    >
      {/* 실행 중 인디케이터 */}
      <Circle size={8} className="text-green-400 fill-green-400 animate-pulse" />
      
      {/* 실행중 텍스트 */}
      <span className="text-xs text-gray-300 group-hover:text-white">실행중</span>
      
      {/* 구분선 */}
      <div className="w-px h-3 bg-gray-600" />
      
      {/* X 아이콘 */}
      <X size={14} className="text-gray-400 group-hover:text-red-400" />
    </button>
  );
}