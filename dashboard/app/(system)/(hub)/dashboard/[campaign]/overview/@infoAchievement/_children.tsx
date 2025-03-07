'use client';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { getAchievementRate } from '@/app/actions/dashboard/overview/achievement-action';
import { searchParamsToJson } from '@/lib/query';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useStateVariables } from '@/components/provider/state-provider';

const OverviewAchievementInfoChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const { data: count, isLoading } = useSWR(
    {
      ...searchParamsToJson(searchParams),
      key: 'getAchievementRate',
      campaign: campaign?.id,
    },
    getAchievementRate
  );

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
