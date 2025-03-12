"use client";

import RefreshButton from "@/components/error/refresh-button";
import useGAPageView from "@/core/monitoring/ga/usePageView";

export default function InvalidAccessPage() {
  useGAPageView();
  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh mx-auto text-base flex flex-col justify-center space-y-[19px]">
      <RefreshButton />
    </div>
  );
}
