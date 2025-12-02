"use client";

import { Campaign } from "@prisma/client";
import { createContext, useContext } from "react";

interface CampaignContextType {
  campaign: Campaign;
}

const CampaignContext = createContext<CampaignContextType | undefined>(
  undefined
);

export const CampaignProvider = ({
  children,
  campaign,
}: {
  children: React.ReactNode;
  campaign: Campaign;
}) => {
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
