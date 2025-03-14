'use client';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useStateVariables } from '@/components/provider/state-provider';
import { swrFetcher } from '@/lib/fetch';
import { useMemo } from 'react';

const OverviewAchievementInfoChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const fallbackData = useMemo(() => ({ result: { count: null } }), []);
  const swrKey = useMemo(() => {
    return `/api/dashboard/overview/info/achievement?${searchParams.toString()}&campaign=${campaign?.id}`;
  }, [searchParams, campaign?.id]);

  const { data } = useSWR(swrKey, swrFetcher, {
    revalidateOnFocus: false,
    fallbackData,
  });

  const count = useMemo(() => data.result?.count, [data]);

  return (
    <InfoCardStyleContainer title="Achievement" iconName="badgeCheck">
      <InfoCardStyleContent
        info={count?.toFixed(2)}
        unit="%"
        caption="Achievement of a goal"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewAchievementInfoChild;
