"use client";

import useGetItem from "@/app/hooks/useGetItem";
import { Campaign } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface CampaignContextType {
  campaign: Campaign | null;
}

const CampaignContext = createContext<CampaignContextType | undefined>(
  undefined
);

export const CampaignProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  const router = useRouter();
  const pathname = usePathname(); // App Router에서 경로 가져오기
  const segments = pathname.split("/").filter(Boolean);

  const routeNotFound = () => {
    router.push("/error/not-found"); // 에러 페이지로 이동
  };

  if (segments.length < 0) {
    routeNotFound();
    return;
  }

  const campaignName = segments[0];

  const { isLoading, error, item } = useGetItem<Campaign>(
    `/api/campaign/?campaign_name=${campaignName}`,
    "force-cache"
  );

  useEffect(() => {
    if (item) {
      console.info("Current Campaign", item);
      setCampaign(item);
    }
  }, [item]);

  if (isLoading) {
    return <div>Loading (campaign)...</div>; // 로딩 화면
  }

  if (error != null) {
    routeNotFound();
    return;
  }

  return (
    <CampaignContext.Provider
      value={{
        campaign,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error(
      "useCampaign는 CampaignProvider 내에서만 사용할 수 있습니다."
    );
  }
  return context;
};
