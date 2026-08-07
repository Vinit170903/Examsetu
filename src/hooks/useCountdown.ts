import { useState, useEffect, useRef, useCallback } from 'react';

export function useCountdown(initialSeconds: number = 30, onExpire?: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const resetTimer = useCallback((newSeconds?: number) => {
    setSecondsLeft(newSeconds ?? initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpireRef.current) {
            onExpireRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  return {
    secondsLeft,
    isActive,
    resetTimer,
    pauseTimer,
    resumeTimer,
  };
}
