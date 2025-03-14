'use client';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export const usePageIndex = (
  searchParams: ReadonlyURLSearchParams,
  itemName: string
) => {
  const [pageIndex, setPageIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const storedPageIndex = sessionStorage.getItem(itemName);
      return storedPageIndex ? parseInt(storedPageIndex, 10) : 1;
    }
    return 1;
  });

  const prevSearchParams = useRef(searchParams.toString()); // 이전 searchParams 저장

  // `pageIndex` 변경 시 `sessionStorage` 업데이트
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (pageIndex > 1) {
        sessionStorage.setItem(itemName, pageIndex.toString());
      }
    }
  }, [pageIndex]);

  // `searchParams` 변경 시 `sessionStorage` 값을 유지하면서, 다른 값일 경우만 `pageIndex` 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (prevSearchParams.current !== searchParams.toString()) {
        // 🔥 searchParams가 변경된 경우에만 실행
        setPageIndex(1);
        sessionStorage.removeItem(itemName);
        prevSearchParams.current = searchParams.toString(); // 이전 값 업데이트
      }
    }
  }, [searchParams]);

  return [pageIndex, setPageIndex] as const;
};
