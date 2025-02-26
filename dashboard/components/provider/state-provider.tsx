/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { swrFetcher } from '@/lib/fetch';
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
import useSWR from 'swr';

type StateVariables = {
  filter: AllFilterData | null;
  session: Session | null;
  role: (Role & any) | null;
  campaigns: Campaign[] | null;
  campaign: Campaign | null;
  setCampaign: React.Dispatch<React.SetStateAction<Campaign | null>>;
};

const StateVariablesContext = createContext<StateVariables | undefined>(
  undefined
);

export const StateVariablesProvider = ({
  children,
  session,
  role,
}: {
  children: ReactNode;
  session: Session | null;
  role: (Role & any) | null;
}) => {
  const { data: filter } = useSWR('/api/dashboard/filter', swrFetcher);
  const { data: { result: { campaigns } } = { result: { campaigns: [] } } } =
    useSWR(`/api/cms/campaign?role=${role?.id || 'admin'}`, swrFetcher);
  const pathname = usePathname();
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
    if (!campaign && pathname !== '/campaign') {
      redirect('/campaign');
    }
  }, [campaign, pathname]);

  return (
    <StateVariablesContext.Provider
      value={{ filter, session, role, campaigns, campaign, setCampaign }}
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
