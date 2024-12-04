import { useState, useRef, useCallback, useEffect } from 'react';

export default function useTimer(initialTime: number = 60) {
  const [time, setTime] = useState(initialTime); // 진행 중인 시간
  const [isRunning, setIsRunning] = useState(false); // 타이머 상태
  const timerRef = useRef<NodeJS.Timeout | null>(null); // 타이머 참조

  // 타이머 시작
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
    }
  }, [isRunning]);

  // 타이머 리셋 함수(타이머 중지)
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setTime(initialTime); // 초기 값으로 리셋
  }, [initialTime]);

  // 리셋 후 다시 진행 함수
  const resetAndStart = useCallback(() => {
    reset();
    start();
  }, [reset, start]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!); // 타이머 정지
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  return {
    time, // 진행 중인 시간
    reset, // 타이머 리셋 함수
    resetAndStart, // 리셋 후 다시 진행 함수
  };
}
