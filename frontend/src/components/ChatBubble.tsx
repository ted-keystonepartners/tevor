'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { ChatBubbleProps } from '@/lib/types';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useChatActions } from '@/lib/store';
import clsx from 'clsx';


export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';
  const isSystem = message.type === 'system';
  const { updateMessage } = useChatActions();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  
  // 이미지 기능 제거됨 - 순수 텍스트 채팅만 지원
  
  // 플레이스홀더 제거 - 단순한 메시지 렌더링만
  
  // 타이핑 효과는 새로운 AI 응답에만 적용
  const shouldType = isAssistant && message.isNewMessage && message.content;
  const { displayedText, isTyping, isComplete } = useTypewriter({
    text: shouldType ? message.content : '',
    speed: 25, // 좀 더 빠르게 조정
    startDelay: 300,
    onComplete: () => {
      // 타이핑 완료 후 isNewMessage를 false로 변경
      if (message.isNewMessage) {
        updateMessage(message.id, { isNewMessage: false });
      }
    }
  });

  // 타이핑 중 부드럽게 스크롤
  useEffect(() => {
    if (shouldType && displayedText) {
      // requestAnimationFrame으로 부드러운 스크롤
      const rafId = requestAnimationFrame(() => {
        const messagesEnd = document.querySelector('[data-messages-end]');
        if (messagesEnd) {
          messagesEnd.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
      });
      
      return () => cancelAnimationFrame(rafId);
    }
  }, [displayedText, shouldType]); // displayedText 변경 시마다 부드럽게 스크롤
  
  // 복사 기능
  const handleCopy = useCallback(async () => {
    if (message.content) {
      try {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 2초 후 리셋
      } catch (err) {
        console.error('복사 실패:', err);
      }
    }
  }, [message.content]);

  // 좋아요/싫어요 기능
  const handleLike = useCallback((isLike: boolean) => {
    setLiked(current => current === isLike ? null : isLike);
    // TODO: 서버에 피드백 전송
  }, []);

  // 자동 분석은 제거 - 사용자가 질문 버튼을 클릭할 때만 분석

  // 기존 로딩 시스템 제거 - 새로운 플레이스홀더 시스템 사용

  // 시스템 메시지는 표시하지 않음 (대신 ServiceActivationCard 사용)
  if (isSystem) {
    return null;
  }

  return (
    <div
      ref={bubbleRef}
      data-message-type={message.type}
      data-is-new-message={message.isNewMessage}
      className={clsx(
        'flex items-start gap-3 mb-4',
        // 사용자 새 메시지는 특별한 애니메이션, AI 메시지는 기존 애니메이션
        isUser && message.isNewMessage ? 'animate-user-message' : 
        message.isNewMessage ? 'animate-push-up' : 'animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >

      {/* 메시지 컨테이너 */}
      <div className={clsx(
        'space-y-2',
        isUser ? 'max-w-[70%] items-end' : 'w-full items-start'
      )}>
        {/* 메시지 버블 */}
        <div className={clsx(
          'break-words overflow-hidden',
          isUser 
            ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm' 
            : 'bg-transparent text-white'
        )}>
          {/* 이미지 기능 제거됨 */}
          
          {/* 텍스트 메시지 */}
          {message.content && (
            <div className={clsx(
              isUser ? "p-4" : "py-2"
            )}>
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {shouldType ? displayedText : message.content}
              </p>
            </div>
          )}
        </div>


        {/* RAG 컨텍스트 상세 정보 (접을 수 있는 형태, 선택사항) - 타이핑 완료 후 표시 */}
        {isAssistant && message.rag_context && (!shouldType || isComplete) && (
          <details className="text-xs text-gray-400 mt-2">
            <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
              참조된 전문 지식 보기
            </summary>
            <div className="mt-2 p-3 bg-gray-800 rounded-lg">
              <p className="mb-1 font-medium text-gray-300">카테고리: {message.rag_context.category}</p>
              {message.rag_context.keywords && (
                <p className="mb-1 text-gray-300">
                  키워드: {message.rag_context.keywords.join(', ')}
                </p>
              )}
              {message.rag_context.matched_content && (
                <div className="mt-2">
                  <p className="font-medium text-gray-300">관련 정보:</p>
                  <pre className="text-xs mt-1 whitespace-pre-wrap text-gray-400">
                    {JSON.stringify(message.rag_context.matched_content, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}


        {/* AI 메시지 액션 버튼들 - 타이핑 완료 후 표시 */}
        {isAssistant && message.content && (!shouldType || isComplete) && (
          <div className="flex items-center gap-2 mt-3 opacity-60 hover:opacity-100 transition-opacity">
            {/* 복사 버튼 */}
            <button
              onClick={handleCopy}
              className={clsx(
                "p-1.5 rounded-md hover:bg-gray-700 transition-colors",
                copied && "bg-green-900/50"
              )}
              title={copied ? "복사됨!" : "복사하기"}
            >
              <Copy size={14} className={copied ? "text-green-400" : "text-gray-400"} />
            </button>

            {/* 좋아요 버튼 */}
            <button
              onClick={() => handleLike(true)}
              className={clsx(
                "p-1.5 rounded-md hover:bg-gray-700 transition-colors",
                liked === true && "bg-green-900/50"
              )}
              title="좋아요"
            >
              <ThumbsUp size={14} className={liked === true ? "text-green-400" : "text-gray-400"} />
            </button>

            {/* 싫어요 버튼 */}
            <button
              onClick={() => handleLike(false)}
              className={clsx(
                "p-1.5 rounded-md hover:bg-gray-700 transition-colors",
                liked === false && "bg-red-900/50"
              )}
              title="싫어요"
            >
              <ThumbsDown size={14} className={liked === false ? "text-red-400" : "text-gray-400"} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}