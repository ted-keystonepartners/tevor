'use client';

import { useEffect, useState, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  startDelay?: number;
  onComplete?: () => void;
  className?: string;
}

export default function TypewriterText({ 
  text, 
  delay = 50,
  startDelay = 0, 
  onComplete,
  className = ''
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (startDelay > 0) {
      const startTimer = setTimeout(() => {
        setIsStarted(true);
      }, startDelay);
      return () => clearTimeout(startTimer);
    } else {
      setIsStarted(true);
    }
  }, [startDelay]);

  useEffect(() => {
    if (!isStarted) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete && !hasCompleted.current) {
      hasCompleted.current = true;
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete, isStarted]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    hasCompleted.current = false;
    
    // Start immediately if no delay, otherwise wait for timer
    if (startDelay === 0) {
      setIsStarted(true);
    } else {
      setIsStarted(false);
    }
  }, [text, startDelay]);

  return <span className={className}>{displayedText}</span>;
}