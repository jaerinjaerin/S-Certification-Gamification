"use client";

import useGAPageView from "@/core/monitoring/ga/usePageView";

export default function CampaignNotReadyPage() {
  useGAPageView();
  return (
    <div>
      <h1>인증제 준비 중</h1>
      <p>해당 국가는 아직 인증제가 준비되지 않았습니다.</p>
    </div>
  );
}
