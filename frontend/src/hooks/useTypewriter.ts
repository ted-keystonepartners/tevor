import { useState, useEffect } from 'react';

interface TypewriterOptions {
  text: string;
  speed?: number;
  startDelay?: number;
  onComplete?: () => void;
}

export const useTypewriter = ({ text, speed = 50, startDelay = 0, onComplete }: TypewriterOptions) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayedText('');
    setIsTyping(true);
    setIsComplete(false);

    const startTyping = () => {
      let currentIndex = 0;

      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          setTimeout(typeNextChar, speed);
        } else {
          setIsTyping(false);
          setIsComplete(true);
          onComplete?.(); // 타이핑 완료 콜백 실행
        }
      };

      typeNextChar();
    };

    const timer = setTimeout(startTyping, startDelay);

    return () => {
      clearTimeout(timer);
      setIsTyping(false);
    };
  }, [text, speed, startDelay]);

  return { displayedText, isTyping, isComplete };
};