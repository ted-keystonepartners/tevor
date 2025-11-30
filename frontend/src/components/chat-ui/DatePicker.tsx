'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  onSelect: (date: string) => void;
  label?: string;
  minDate?: string;
}

export default function DatePicker({ onSelect, label = "시공 희망일", minDate }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const min = minDate || today;

  const handleSelect = () => {
    if (selectedDate) {
      onSelect(selectedDate);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-5 max-w-md">
      <div className="mb-4">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
          <Calendar size={20} />
          {label}
        </h3>
        <p className="text-gray-400 text-sm">
          원하시는 시공 시작일을 선택해주세요
        </p>
      </div>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        min={min}
        className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
      />

      <button
        onClick={handleSelect}
        disabled={!selectedDate}
        className={`w-full py-2.5 rounded-lg font-medium transition-all ${
          selectedDate
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        선택 완료
      </button>
    </div>
  );
}