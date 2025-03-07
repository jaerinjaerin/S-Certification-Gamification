/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Campaign, Role } from '@prisma/client';
import { Session } from 'next-auth';
import { redirect, usePathname } from 'next/navigation';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

type StateVariables = {
  filter: AllFilterData | null;
  session: Session | null;
  role: (Role & any) | null;
  campaigns: Campaign[] | null;
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  campaign: Campaign | null;
  setCampaign: React.Dispatch<React.SetStateAction<Campaign | null>>;
};

const StateVariablesContext = createContext<StateVariables | undefined>(
  undefined
);

export const StateVariablesProvider = ({
  children,
  filter,
  session,
  role,
  campaigns: initCampaigns,
}: {
  children: ReactNode;
  filter: AllFilterData | null;
  session: Session | null;
  role: (Role & any) | null;
  campaigns: Campaign[];
}) => {
  const pathname = usePathname();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initCampaigns);
  const [campaign, setCampaign] = useState<Campaign | null>(() => {
    // sessionStorage에 저장된 캠페인 데이터 가져오기 (새로고침 유지)
    if (typeof window !== 'undefined') {
      const storedCampaign = sessionStorage.getItem('campaign');
      return storedCampaign ? JSON.parse(storedCampaign) : null;
    }
    return null;
  });

  // campaign 변경 시 sessionStorage업데이트
  useEffect(() => {
    if (campaign) {
      sessionStorage.setItem('campaign', JSON.stringify(campaign));
    } else {
      sessionStorage.removeItem('campaign'); // 값이 없으면 제거
    }
  }, [campaign]);

  // 캠페인 데이터 없으면 캠페인으로 리다이렉트
  useEffect(() => {
    if (pathname === '/campaign/create') return;
    if (!campaign && pathname !== '/campaign') {
      redirect('/campaign');
    }
  }, [campaign, pathname]);

  return (
    <StateVariablesContext.Provider
      value={{
        filter,
        session,
        role,
        campaigns,
        setCampaigns,
        campaign,
        setCampaign,
      }}
    >
      {children}
    </StateVariablesContext.Provider>
  );
};

// Custom hook for consuming the global state
export const useStateVariables = () => {
  const context = useContext(StateVariablesContext);
  if (!context) {
    throw new Error(
      'useStateVariables must be used within a StateVariablesProvider'
    );
  }
  return context;
};
