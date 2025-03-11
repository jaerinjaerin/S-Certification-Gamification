'use client';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useStateVariables } from '@/components/provider/state-provider';
import { swrFetcher } from '@/lib/fetch';

const OverviewAchievementInfoChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const { data } = useSWR(
    `/api/dashboard/overview/info/achievement?${searchParams.toString()}&campaign=${campaign?.id}`,
    swrFetcher,
    { fallbackData: { result: { count: null } } }
  );
  const count = data.result?.count;

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
