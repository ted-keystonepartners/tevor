'use client';

import { ServiceConfig } from '../../base/types';

interface ServiceIntroProps {
  service: ServiceConfig;
}

export default function ServiceIntro({ service }: ServiceIntroProps) {
  const features = [
    { icon: '✅', title: '안전 시공', desc: '전문 장비와 숙련된 기술진' },
    { icon: '🧹', title: '깨끗한 마무리', desc: '폐기물 처리까지 완벽하게' },
    { icon: '📋', title: '정식 허가', desc: '모든 법적 절차 대행' },
    { icon: '💰', title: '투명한 가격', desc: '숨겨진 비용 없는 명확한 견적' }
  ];

  return (
    <div className="bg-gray-800 rounded-2xl p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{service.emoji}</span>
        <div>
          <h3 className="text-xl font-bold text-white">{service.name}</h3>
          <p className="text-gray-400 text-sm">{service.description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex gap-3">
            <span className="text-xl">{feature.icon}</span>
            <div>
              <h4 className="text-white font-medium">{feature.title}</h4>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm">
          20년 경력의 전문가들이 안전하고 깨끗한 철거를 약속드립니다.
        </p>
      </div>
    </div>
  );
}