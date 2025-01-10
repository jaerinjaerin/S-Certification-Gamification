"use client";

import useGAPageView from "@/core/monitoring/ga/usePageView";

export default function InvalidAccessPage() {
  useGAPageView();
  return (
    <div>
      <h1>잘못된 접근입니다.</h1>
      <p>올바른 URL로 접속해주세요.</p>
    </div>
  );
}
