"use client";

import useGAPageView from "@/core/monitoring/ga/usePageView";
import Link from "next/link";

export default function CampaignClosedPage() {
  useGAPageView();
  return (
    <div>
      <h1>이 캠페인은 종료되었습니다.</h1>
      <p>다른 캠페인을 확인해주세요.</p>
      <Link href="/">홈으로 돌아가기</Link>
    </div>
  );
}
