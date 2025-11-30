'use client';

import { DemolitionData } from '../types';
import { Check, Calendar, MapPin, Ruler, Trash2, Building } from 'lucide-react';

interface ServiceSummaryProps {
  data: DemolitionData;
  onConfirm: () => void;
  onEdit?: () => void;
}

export default function ServiceSummary({ data, onConfirm, onEdit }: ServiceSummaryProps) {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 max-w-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">신청 내용 확인</h3>
        <p className="text-gray-400 text-sm">
          입력하신 정보를 확인해주세요
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {data.photos && data.photos.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
              <Check size={12} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">현장 사진</p>
              <p className="text-gray-400 text-sm">{data.photos.length}장 업로드 완료</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <MapPin size={20} className="text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-medium">현장 주소</p>
            <p className="text-gray-400 text-sm">{data.address}</p>
            {data.addressDetail && (
              <p className="text-gray-400 text-sm">{data.addressDetail}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar size={20} className="text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-medium">시공 희망일</p>
            <p className="text-gray-400 text-sm">
              {data.desiredDate ? new Date(data.desiredDate).toLocaleDateString('ko-KR') : '미정'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Trash2 size={20} className="text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-medium">폐기물 처리</p>
            <p className="text-gray-400 text-sm">
              {data.wasteDisposal ? '포함' : '미포함'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Ruler size={20} className="text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-medium">면적</p>
            <p className="text-gray-400 text-sm">{data.area}평</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Building size={20} className="text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-medium">엘리베이터</p>
            <p className="text-gray-400 text-sm">
              {data.hasElevator ? '있음' : '없음 (계단 이용)'}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <p className="text-gray-400 text-sm mb-4">
          * 담당자가 24시간 이내에 연락드리겠습니다
        </p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            신청 완료
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              수정
            </button>
          )}
        </div>
      </div>
    </div>
  );
}