'use client';

interface ServiceButton {
  id: string;
  emoji: string;
  label: string;
  onClick: () => void;
}

interface ChatServiceButtonsProps {
  onServiceSelect: (serviceId: string) => void;
}

export default function ChatServiceButtons({ onServiceSelect }: ChatServiceButtonsProps) {
  const services: ServiceButton[] = [
    {
      id: 'premium-demolition',
      emoji: '🏗️',
      label: '프리미엄철거',
      onClick: () => onServiceSelect('premium-demolition'),
    },
    {
      id: 'site-photo',
      emoji: '📸',
      label: '현장사진기록',
      onClick: () => onServiceSelect('site-photo'),
    },
    {
      id: 'ai-styling',
      emoji: '✨',
      label: 'AI스타일링',
      onClick: () => onServiceSelect('ai-styling'),
    },
    {
      id: 'payment-agency',
      emoji: '💳',
      label: '결제대행서비스',
      onClick: () => onServiceSelect('payment-agency'),
    },
    {
      id: 'as-center',
      emoji: '🔧',
      label: 'AS센터',
      onClick: () => onServiceSelect('as-center'),
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => service.onClick()}
          className="
            inline-flex items-center gap-2
            px-5 py-2.5
            bg-gray-800 hover:bg-gray-700
            text-white
            rounded-full
            transition-all duration-200
            border border-gray-700 hover:border-gray-600
            text-sm
            whitespace-nowrap
          "
        >
          <span className="text-base">{service.emoji}</span>
          <span className="font-normal">{service.label}</span>
        </button>
      ))}
    </div>
  );
}