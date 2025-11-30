'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface ServiceActivationCardProps {
  serviceName: string;
  serviceEmoji: string;
  type: 'start' | 'end';
}

export default function ServiceActivationCard({ 
  serviceName, 
  serviceEmoji,
  type
}: ServiceActivationCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 마운트 후 애니메이션 시작
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="flex justify-center my-4">
      <div className={clsx(
        "px-4 py-2 rounded-lg",
        "bg-gray-800/50 text-gray-400",
        "text-xs",
        "transition-all duration-300 ease-out",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}>
        {type === 'start' ? (
          <span>{serviceName} 서비스가 시작되었습니다</span>
        ) : (
          <span>{serviceName} 서비스가 종료되었습니다</span>
        )}
      </div>
    </div>
  );
}