"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function useGAPageView() {
  const pathname = usePathname(); // 현재 페이지 경로를 가져온다.

  useEffect(() => {
    // sendGAEvent("page_view", { page_path: pathname }); // 페이지 경로가 변경될 때마다 페이지뷰 이벤트를 전송한다.
    // GA 코드가 로드되었는지 확인
    if (typeof window !== "undefined" && window.dataLayer) {
      sendGAEvent("page_view", { page_path: pathname });
    } else {
      console.warn("GA tracking code not loaded or dataLayer not initialized");
    }
  }, [pathname]); // pathname이 변경될 때마다 useEffect 훅이 실행된다.

  return null;
}
