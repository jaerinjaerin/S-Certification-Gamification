import { useRef, useEffect } from 'react';

export const useAbortController = () => {
  const controllerRef = useRef<AbortController | null>(null);

  // 새로운 컨트롤러 생성 함수
  const createController = () => {
    if (controllerRef.current) {
      controllerRef.current.abort(); // 기존 요청 취소
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    return controller;
  };

  // 현재 실행 중인 요청 취소 함수
  const abort = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null; // 컨트롤러를 초기화
    }
  };

  // 컴포넌트가 언마운트될 때 자동 취소
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return { createController, abort };
};
