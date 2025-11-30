'use client';

import { useState } from 'react';
import { validateQuoteForm, sanitizeQuoteData, type QuoteFormData } from '../validators';

interface QuoteFormProps {
  onSubmit: (data: QuoteFormData) => void;
}

export default function QuoteForm({ onSubmit }: QuoteFormProps) {
  const [formData, setFormData] = useState<QuoteFormData>({
    demolitionType: '',
    area: '',
    location: '',
    desiredDate: '',
    contact: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demolitionTypes = [
    '주택 철거',
    '상가 철거',
    '인테리어 철거',
    '부분 철거',
    '기타'
  ];

  const handleSubmit = async () => {
    // 연속 클릭 방지
    if (isSubmitting) return;
    
    // 검증
    const validation = validateQuoteForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // 에러 초기화 및 제출 상태 설정
    setErrors({});
    setIsSubmitting(true);
    
    try {
      // 데이터 정제 후 제출
      const sanitizedData = sanitizeQuoteData(formData);
      await onSubmit(sanitizedData);
      
      // 폼 초기화
      setFormData({
        demolitionType: '',
        area: '',
        location: '',
        desiredDate: '',
        contact: ''
      });
    } catch (error) {
      console.error('폼 제출 중 오류:', error);
      setErrors({ submit: '제출 중 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 입력 변경 시 해당 필드 에러 제거
  const handleFieldChange = (field: keyof QuoteFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-5 max-w-md">
      <h3 className="text-lg font-bold text-white mb-4">견적 요청서</h3>
      
      {/* 철거 유형 선택 */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">철거 유형 <span className="text-red-400">*</span></label>
        <div className="flex flex-wrap gap-2">
          {demolitionTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleFieldChange('demolitionType', type)}
              className={`px-3 py-2 rounded-full text-sm transition-all ${
                formData.demolitionType === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.demolitionType && (
          <p className="text-red-400 text-xs mt-1">{errors.demolitionType}</p>
        )}
      </div>

      {/* 면적 입력 */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">면적 (㎡) <span className="text-red-400">*</span></label>
        <input
          type="number"
          value={formData.area}
          onChange={(e) => handleFieldChange('area', e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          placeholder="예: 100"
          min="1"
          max="10000"
        />
        {errors.area && (
          <p className="text-red-400 text-xs mt-1">{errors.area}</p>
        )}
      </div>

      {/* 위치 입력 */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">위치 <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleFieldChange('location', e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          placeholder="예: 서울시 강남구"
          maxLength={100}
        />
        {errors.location && (
          <p className="text-red-400 text-xs mt-1">{errors.location}</p>
        )}
      </div>

      {/* 희망 일정 */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">희망 시작일</label>
        <input
          type="date"
          value={formData.desiredDate}
          onChange={(e) => handleFieldChange('desiredDate', e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.desiredDate && (
          <p className="text-red-400 text-xs mt-1">{errors.desiredDate}</p>
        )}
      </div>

      {/* 연락처 */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">연락처 (선택)</label>
        <input
          type="tel"
          value={formData.contact}
          onChange={(e) => handleFieldChange('contact', e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          placeholder="010-0000-0000"
          maxLength={13}
        />
        {errors.contact && (
          <p className="text-red-400 text-xs mt-1">{errors.contact}</p>
        )}
      </div>

      {/* 전체 에러 메시지 */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}
      
      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full py-3 rounded-lg font-medium transition-all ${
          isSubmitting
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? '처리 중...' : '견적 요청하기'}
      </button>
    </div>
  );
}