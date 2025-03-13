/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { swrFetcher } from '@/lib/fetch';
import { Campaign, Role } from '@prisma/client';
import { Session } from 'next-auth';
import { redirect, usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { getCampaign } from '@/app/actions/campaign-action';
import useSWR from 'swr';

type CampaignData = {
  id: string;
  name: string;
  createdAt: Date;
  startedAt: Date;
  endedAt: Date;
  deleted: boolean;
};

type CampaignProps = Omit<Campaign, 'startedAt' | 'endedAt'> & {
  startedAt: string;
  endedAt: string;
};

type StateVariables = {
  filter: AllFilterData | null;
  session: Session | null;
  role: (Role & any) | null;
  campaigns: CampaignData[] | null;
  campaign: CampaignProps | null;
  setCampaign: (cid: string) => Promise<void>;
};

const StateVariablesContext = createContext<StateVariables | undefined>(
  undefined
);

// localStorage/sessionStorage 래퍼 함수
const storage = {
  get: (): any => {
    if (typeof window === 'undefined') return null;
    try {
      const item = sessionStorage.getItem('campaign');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting campaign from sessionStorage:`, error);
      return null;
    }
  },
  set: (value: any): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem('campaign', JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting campaign in sessionStorage:`, error);
    }
  },
  remove: (): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem('campaign');
    } catch (error) {
      console.error(`Error removing campaign from sessionStorage:`, error);
    }
  },
};

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
  campaigns: CampaignData[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  // 캠페인 데이터를 위한 레퍼런스 객체 사용
  const [campaigns, setCampaigns] = useState<CampaignData[]>(initCampaigns);
  const [campaign, setCampaignState] = useState<CampaignProps | null>(
    storage.get
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 이전 pathname 추적
  const prevPathnameRef = useRef<string | null>(null);

  // SWR 캐시 키 최적화
  const swrKey = useMemo(() => {
    return `/api/cms/campaign?role=${role?.name || 'ADMIN'}`;
  }, [role?.name]);

  const { data: campaignData } = useSWR(swrKey, swrFetcher, {
    fallbackData: { result: { campaigns: initCampaigns } },
    // revalidateOnFocus: false,
    dedupingInterval: 5000,
    revalidateIfStale: false, // 오래된 데이터 자동 재검증 비활성화
    shouldRetryOnError: false, // 에러 시 재시도 비활성화
  });

  // 메모이제이션된 setCampaign 핸들러 - ID만 저장
  const setCampaign = useCallback(async (cid: string | null) => {
    if (cid) {
      const { result: newCampaign } = await getCampaign(cid);
      if (newCampaign) setCampaignState(newCampaign);

      storage.set(newCampaign);
    } else {
      storage.remove();
    }
  }, []);

  // 다이얼로그 닫는 핸들러 메모이제이션
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setCampaign(null);
    //
    router.replace('/campaign');
  }, [setCampaign]);

  // campaignData가 변경될 때 campaign 검증 및 다이얼로그 처리
  useEffect(() => {
    if (campaignData?.result?.campaigns) {
      const campaignsCalled = campaignData.result.campaigns;
      setCampaigns(campaignsCalled);

      if (campaign) {
        const existed = campaignsCalled.find(
          (c: CampaignData) => c.id === campaign.id
        );

        if (!existed) {
          setIsDialogOpen(true);
        } else {
          if (existed.id !== campaign.id) {
            setCampaign(existed);
          }
        }
      }
    }

    return () => {
      // 타임아웃 클린업
      if (dialogTimeoutRef.current) {
        clearTimeout(dialogTimeoutRef.current);
        dialogTimeoutRef.current = null;
      }
    };
  }, [campaignData, campaign]);

  // pathname이 변경될 때 리다이렉트 처리 - 최적화
  useEffect(() => {
    // 같은 pathname으로의 중복 처리 방지
    if (pathname === prevPathnameRef.current) return;
    prevPathnameRef.current = pathname;

    // 불필요한 리다이렉트 방지
    if (pathname === '/campaign/create' || pathname === '/role') return;

    const shouldRedirect = !campaign && pathname !== '/campaign';

    if (shouldRedirect) {
      redirect('/campaign');
    }
  }, [campaign, pathname]);

  // 컨텍스트 값 메모이제이션 - 성능 최적화
  const contextValue = useMemo(
    () => ({
      filter,
      session,
      role,
      campaigns,
      campaign,
      setCampaign,
    }),
    [filter, session, role, campaigns, campaign, setCampaign]
  );

  return (
    <StateVariablesContext.Provider value={contextValue}>
      {children}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
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

// 메모이제이션된 커스텀 훅
export const useStateVariables = () => {
  const context = useContext(StateVariablesContext);
  if (!context) {
    throw new Error(
      'useStateVariables must be used within a StateVariablesProvider'
    );
  }
  return context;
};
