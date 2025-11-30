'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  onUpload: (files: File[]) => void;
  onSkip?: () => void;
  maxFiles?: number;
}

export default function PhotoUpload({ onUpload, onSkip, maxFiles = 5 }: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
      return;
    }

    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-5 max-w-md">
      <div className="mb-4">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
          <Camera size={20} />
          현장 사진 업로드
        </h3>
        <p className="text-gray-400 text-sm">
          철거할 현장의 사진을 올려주세요 (최대 {maxFiles}장)
        </p>
      </div>

      {/* 업로드 영역 */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors mb-4"
      >
        <Upload size={32} className="mx-auto mb-2 text-gray-500" />
        <p className="text-gray-400 text-sm">클릭하여 사진 선택</p>
        <p className="text-gray-500 text-xs mt-1">JPG, PNG (최대 10MB)</p>
      </div>

      {/* 미리보기 */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img 
                src={preview} 
                alt={`사진 ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0}
          className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
            selectedFiles.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedFiles.length > 0 ? `${selectedFiles.length}장 업로드` : '사진 선택하기'}
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            건너뛰기
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}