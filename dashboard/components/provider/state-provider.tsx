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
import useSWR, { KeyedMutator } from 'swr';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'; // 다이얼로그 추가
import { Button } from '../ui/button';

type StateVariables = {
  filter: AllFilterData | null;
  session: Session | null;
  role: (Role & any) | null;
  campaigns: Campaign[] | null;
  campaign: Campaign | null;
  setCampaign: React.Dispatch<React.SetStateAction<Campaign | null>>;
  campaignMutate: KeyedMutator<{ result: { campaigns: Campaign[] } }>;
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
    if (typeof window !== 'undefined') {
      const storedCampaign = sessionStorage.getItem('campaign');
      return storedCampaign ? JSON.parse(storedCampaign) : null;
    }
    return null;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false); // 다이얼로그 상태 추가

  const { data: campaignData, mutate: campaignMutate } = useSWR(
    `/api/cms/campaign?role=${role?.name || 'ADMIN'}`,
    swrFetcher,
    { fallbackData: { result: { campaigns: initCampaigns } } }
  );

  // campaignData가 변경될 때 campaign 검증 및 다이얼로그 처리
  useEffect(() => {
    if (campaignData) {
      const campaignsCalled = campaignData.result.campaigns;
      setCampaigns(campaignsCalled);

      const existed = campaignsCalled.find(
        (c: Campaign) => c.id === campaign?.id
      );

      if (!existed && campaign !== null) {
        setIsDialogOpen(true);
      }
    }
  }, [campaignData]);

  // 다이얼로그 닫을 때 캠페인 리스트로 이동
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCampaign(null);
  };

  // campaign 변경 시 sessionStorage 업데이트
  useEffect(() => {
    if (campaign) {
      sessionStorage.setItem('campaign', JSON.stringify(campaign));
    } else {
      sessionStorage.removeItem('campaign'); // 값이 없으면 제거
    }
  }, [campaign]);

  // 캠페인 데이터 없으면 `/campaign` 페이지로 리다이렉트
  useEffect(() => {
    if (pathname === '/campaign/create' || pathname === '/role') return;
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
        campaign,
        setCampaign,
        campaignMutate,
      }}
    >
      {children}

      {/* 캠페인 삭제 시 다이얼로그 표시 */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogTitle>Certification Deleted</DialogTitle>
          <p>
            The selected certification has been deleted. You will be redirected
            to the certification list.
          </p>
          <div className="flex justify-end mt-4">
            <Button onClick={handleCloseDialog}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
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
