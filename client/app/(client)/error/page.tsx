"use client";

import useGAPageView from "@/core/monitoring/ga/usePageView";

export default function CommonErrorPage() {
  useGAPageView();
  return (
    <div>
      <h1>잠시 후에 다시 시도해주세요.</h1>
    </div>
  );
}
