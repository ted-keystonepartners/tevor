'use client';

import { Home, Image, Palette, FileText, Search } from 'lucide-react';
import { useState } from 'react';

interface ServiceButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  emoji?: string;
  onClick: () => void;
}

export default function ServiceButtons() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const services: ServiceButton[] = [
    {
      id: 'space-design',
      emoji: '🏠',
      icon: <Home size={20} />,
      label: '공간 디자인',
      onClick: () => {
        setSelectedService('space-design');
        console.log('공간 디자인 서비스 선택');
      },
    },
    {
      id: 'image-generation',
      emoji: '🎨',
      icon: <Palette size={20} />,
      label: '이미지 생성',
      onClick: () => {
        setSelectedService('image-generation');
        console.log('이미지 생성 서비스 선택');
      },
    },
    {
      id: 'style-consulting',
      emoji: '💡',
      icon: <Image size={20} />,
      label: '스타일 컨설팅',
      onClick: () => {
        setSelectedService('style-consulting');
        console.log('스타일 컨설팅 서비스 선택');
      },
    },
    {
      id: 'catalog',
      emoji: '📚',
      icon: <FileText size={20} />,
      label: '카탈로그',
      onClick: () => {
        setSelectedService('catalog');
        console.log('카탈로그 서비스 선택');
      },
    },
    {
      id: 'deep-research',
      emoji: '🔍',
      icon: <Search size={20} />,
      label: 'Deep Research',
      onClick: () => {
        setSelectedService('deep-research');
        console.log('Deep Research 서비스 선택');
      },
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">
          안녕하세요
        </h1>
        <p className="text-3xl font-bold text-white">
          무엇을 도와드릴까요?
        </p>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={service.onClick}
            className={`
              w-full px-5 py-4 
              bg-gray-800 hover:bg-gray-700 
              text-white text-left
              rounded-2xl transition-all duration-200
              flex items-center gap-3
              border border-gray-700 hover:border-gray-600
              ${selectedService === service.id ? 'ring-2 ring-purple-500 bg-gray-700' : ''}
            `}
          >
            <span className="text-2xl">{service.emoji}</span>
            <span className="text-base font-medium">{service.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}