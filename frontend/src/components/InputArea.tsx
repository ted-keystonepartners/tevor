'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { InputAreaProps } from '@/lib/types';
import { Send, Plus, Puzzle, Camera, Paperclip } from 'lucide-react';
import clsx from 'clsx';

// 상수 정의
const ANIMATION_DURATION = 150; // ms
const MENU_CONFIGS = {
  PLUS: 'plus',
  EXTENSIONS: 'extensions'
} as const;

type MenuType = typeof MENU_CONFIGS[keyof typeof MENU_CONFIGS];

interface MenuState {
  show: boolean;
  closing: boolean;
}

interface ExtendedInputAreaProps extends InputAreaProps {
  onServiceSelect?: (serviceId: string) => void;
  placeholder?: string;
}

export default function InputArea({ 
  onSendMessage, 
  onUploadFile,
  isLoading = false, 
  disabled = false,
  onServiceSelect,
  placeholder = '메시지를 입력하세요...'
}: ExtendedInputAreaProps) {
  const [message, setMessage] = useState('');
  const [menus, setMenus] = useState<Record<MenuType, MenuState>>({
    [MENU_CONFIGS.PLUS]: { show: false, closing: false },
    [MENU_CONFIGS.EXTENSIONS]: { show: false, closing: false }
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const extensionsMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 통합 메뉴 닫기 함수
  const closeMenu = (menuType: MenuType) => {
    setMenus(prev => ({
      ...prev,
      [menuType]: { ...prev[menuType], closing: true }
    }));
    
    setTimeout(() => {
      setMenus(prev => ({
        ...prev,
        [menuType]: { show: false, closing: false }
      }));
    }, ANIMATION_DURATION);
  };

  // 통합 메뉴 토글 함수
  const toggleMenu = (menuType: MenuType) => {
    if (menus[menuType].show) {
      closeMenu(menuType);
    } else {
      setMenus(prev => ({
        ...prev,
        [menuType]: { show: true, closing: false }
      }));
    }
  };

  // 외부 클릭시 메뉴 닫기
  useEffect(() => {
    const menuRefs = [
      { ref: plusMenuRef, type: MENU_CONFIGS.PLUS },
      { ref: extensionsMenuRef, type: MENU_CONFIGS.EXTENSIONS }
    ];

    const handleClickOutside = (event: MouseEvent) => {
      menuRefs.forEach(({ ref, type }) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          if (menus[type].show && !menus[type].closing) {
            closeMenu(type);
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menus]);

  // 컴포넌트 마운트 시 자동 포커스
  useEffect(() => {
    // 초기 로드 시 입력창에 포커스
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, []);

  // disabled 상태가 false로 변경될 때 (서비스 종료 등) 포커스 복원
  useEffect(() => {
    if (!disabled && !isLoading) {
      textareaRef.current?.focus();
    }
  }, [disabled, isLoading]);

  // 메시지 전송
  const handleSendMessage = () => {
    if (!disabled && !isLoading && message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      // 메시지 전송 후 입력창에 다시 포커스
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  // 엔터 키 처리
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 파일 업로드 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadFile) {
      onUploadFile(file, message.trim() || undefined);
      setMessage('');
    }
    closeMenu(MENU_CONFIGS.PLUS);
  };

  // 파일 액션 핸들러들
  const handleImageUpload = () => {
    imageInputRef.current?.click();
    closeMenu(MENU_CONFIGS.PLUS);
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
    closeMenu(MENU_CONFIGS.PLUS);
  };

  // 메뉴 아이템 데이터
  const plusMenuItems = [
    { icon: Camera, label: '사진 업로드', onClick: handleImageUpload },
    { icon: Paperclip, label: '파일 첨부', onClick: handleFileAttach }
  ];

  const extensionMenuItems = [
    { 
      emoji: '🏗️', 
      label: '프리미엄철거', 
      onClick: () => { 
        if (onServiceSelect) {
          onServiceSelect('premium-demolition');
        } else {
          onSendMessage('프리미엄철거 서비스를 시작합니다');
        }
        closeMenu(MENU_CONFIGS.EXTENSIONS); 
      } 
    },
    { 
      emoji: '📸', 
      label: '현장사진기록', 
      onClick: () => { 
        if (onServiceSelect) {
          onServiceSelect('site-photo');
        } else {
          onSendMessage('현장사진기록 서비스를 시작합니다');
        }
        closeMenu(MENU_CONFIGS.EXTENSIONS); 
      } 
    },
    { 
      emoji: '✨', 
      label: 'AI스타일링', 
      onClick: () => { 
        if (onServiceSelect) {
          onServiceSelect('ai-styling');
        } else {
          onSendMessage('AI스타일링 서비스를 시작합니다');
        }
        closeMenu(MENU_CONFIGS.EXTENSIONS); 
      } 
    },
    { 
      emoji: '💳', 
      label: '결제대행서비스', 
      onClick: () => { 
        if (onServiceSelect) {
          onServiceSelect('payment-agency');
        } else {
          onSendMessage('결제대행서비스를 시작합니다');
        }
        closeMenu(MENU_CONFIGS.EXTENSIONS); 
      } 
    },
    { 
      emoji: '🔧', 
      label: 'AS센터', 
      onClick: () => { 
        if (onServiceSelect) {
          onServiceSelect('as-center');
        } else {
          onSendMessage('AS센터 서비스를 시작합니다');
        }
        closeMenu(MENU_CONFIGS.EXTENSIONS); 
      } 
    }
  ];

  return (
    <div className="bg-gray-900 px-4 py-3 relative">
      {/* 블러 배경 오버레이 - 전체 화면 */}
      {menus.extensions.show && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => closeMenu(MENU_CONFIGS.EXTENSIONS)}
        />
      )}
      
      <div className="max-w-4xl mx-auto relative">
        
        
        {/* 입력 박스 */}
        <div className={clsx(
          "relative flex items-end bg-gray-800 rounded-2xl border transition-all duration-300 z-40",
          disabled 
            ? "border-gray-800" 
            : "border-gray-700 focus-within:border-blue-500"
        )}>
          {/* 서비스 진행 중 블러 오버레이 */}
          {disabled && (
            <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-md rounded-2xl z-50 flex items-center justify-center">
              <p className="text-gray-400 text-sm font-medium">서비스 진행 중...</p>
            </div>
          )}
          
          {/* 확장 서비스 메뉴 (채팅창 위) */}
          {menus.extensions.show && (
            <div 
              ref={extensionsMenuRef}
              className={clsx(
                "absolute bottom-full left-0 mb-4 z-50",
                "flex flex-wrap gap-2 max-w-md",
                menus.extensions.closing ? "animate-slide-down" : "animate-slide-up"
              )}
            >
              {extensionMenuItems.map((item, index) => (
                <button 
                  key={index}
                  onClick={item.onClick}
                  className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-5 py-2.5 shadow-lg hover:bg-gray-700 transition-all duration-200 text-sm text-gray-200 hover:shadow-xl hover:-translate-y-0.5 transform whitespace-nowrap"
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
          {/* + 버튼 */}
          <div className="relative" ref={plusMenuRef}>
            <button
              type="button"
              onClick={() => toggleMenu(MENU_CONFIGS.PLUS)}
              className={clsx(
                "flex-shrink-0 p-2 ml-3 my-2 transition-colors rounded-lg",
                menus.plus.show
                  ? "text-blue-400 bg-blue-900/50" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              )}
              title="기능 메뉴"
              disabled={disabled}
            >
              <Plus size={20} />
            </button>

            {/* + 버튼 메뉴 */}
            {menus.plus.show && (
              <div className={clsx(
                "absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 min-w-48 z-50",
                menus.plus.closing ? "animate-slide-down" : "animate-slide-up"
              )}>
                {plusMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors duration-200"
                    disabled={!onUploadFile}
                  >
                    <item.icon size={16} className="text-gray-400" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 확장 서비스 버튼 */}
          <button
            onClick={() => toggleMenu(MENU_CONFIGS.EXTENSIONS)}
            className={clsx(
              "flex-shrink-0 p-2 ml-2 my-2 transition-colors rounded-lg",
              menus.extensions.show
                ? "text-blue-400 bg-blue-900/50" 
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            )}
            title="서비스 선택"
            disabled={disabled}
          >
            <Puzzle size={18} />
          </button>

          {/* 메시지 입력 영역 */}
          <div className="flex-1 px-4">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              rows={1}
              disabled={disabled || isLoading}
              className={clsx(
                "w-full resize-none bg-transparent border-none outline-none",
                "placeholder:text-gray-400 text-white",
                "py-2 px-0 min-h-[24px] max-h-32 overflow-y-auto",
                "disabled:cursor-not-allowed disabled:text-gray-500"
              )}
              style={{
                height: 'auto',
                minHeight: '24px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
          </div>

          {/* 전송 버튼 */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || disabled || isLoading}
            className={clsx(
              "flex-shrink-0 p-2 mr-3 my-2 rounded-lg transition-colors",
              "focus:outline-none",
              message.trim() && !disabled && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            )}
            title="메시지 전송"
          >
            <Send size={18} />
          </button>
        </div>

          {/* 숨겨진 파일 입력들 */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
            onChange={handleFileUpload}
            className="hidden"
          />
          
        
        {/* 면책 문구 */}
        <div className="text-center mt-3 mb-1">
          <p className="text-xs text-gray-500">
            TEVOR는 정보 제공 시 실수를 할 수 있으니 다시 한번 확인하세요
          </p>
        </div>
      </div>
    </div>
  );
}