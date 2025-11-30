'use client';

import { Check } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  icon?: string;
}

interface SelectOptionsProps {
  title: string;
  description?: string;
  options: Option[];
  onSelect: (selected: string) => void;
  multiple?: boolean;
}

export default function SelectOptions({ 
  title, 
  description, 
  options, 
  onSelect,
  multiple = false 
}: SelectOptionsProps) {
  
  const handleSelect = (optionId: string) => {
    onSelect(optionId);
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-5 max-w-md">
      <div className="mb-4">
        <h3 className="text-white font-medium mb-1">{title}</h3>
        {description && (
          <p className="text-gray-400 text-sm">{description}</p>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              {option.icon && <span className="text-xl">{option.icon}</span>}
              <span className="font-medium">{option.label}</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Check size={18} className="text-blue-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}