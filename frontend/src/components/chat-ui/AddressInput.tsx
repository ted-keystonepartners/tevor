'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';

interface AddressInputProps {
  onSubmit: (address: string, detail: string) => void;
}

export default function AddressInput({ onSubmit }: AddressInputProps) {
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const handleSubmit = () => {
    if (address.trim()) {
      onSubmit(address.trim(), detailAddress.trim());
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-5 max-w-md">
      <div className="mb-4">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
          <MapPin size={20} />
          현장 주소 입력
        </h3>
        <p className="text-gray-400 text-sm">
          철거가 필요한 현장의 정확한 주소를 입력해주세요
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">기본 주소 *</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="예: 서울시 강남구 테헤란로 123"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">상세 주소</label>
          <input
            type="text"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="예: 5층 501호"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!address.trim()}
        className={`w-full mt-4 py-2.5 rounded-lg font-medium transition-all ${
          address.trim()
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        다음
      </button>
    </div>
  );
}