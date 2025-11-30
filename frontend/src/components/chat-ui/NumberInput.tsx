'use client';

import { useState } from 'react';
import { Ruler } from 'lucide-react';

interface NumberInputProps {
  title: string;
  description?: string;
  unit: string;
  placeholder?: string;
  min?: number;
  max?: number;
  onSubmit: (value: number) => void;
}

export default function NumberInput({
  title,
  description,
  unit,
  placeholder = "0",
  min = 0,
  max,
  onSubmit
}: NumberInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= min && (!max || numValue <= max)) {
      onSubmit(numValue);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-5 max-w-md">
      <div className="mb-4">
        <h3 className="text-white font-medium mb-1 flex items-center gap-2">
          <Ruler size={20} />
          {title}
        </h3>
        {description && (
          <p className="text-gray-400 text-sm">{description}</p>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          placeholder={placeholder}
          min={min}
          max={max}
        />
        <div className="px-4 py-2.5 bg-gray-700 text-gray-400 rounded-lg border border-gray-600">
          {unit}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!value || parseFloat(value) < min || (max && parseFloat(value) > max)}
        className={`w-full py-2.5 rounded-lg font-medium transition-all ${
          value && parseFloat(value) >= min && (!max || parseFloat(value) <= max)
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        다음
      </button>
    </div>
  );
}