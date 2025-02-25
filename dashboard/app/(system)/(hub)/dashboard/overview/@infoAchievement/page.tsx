'use client';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useOverviewContext } from '../_provider/provider';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import useSWR from 'swr';

const OverviewAchievementInfo = () => {
  const { state } = useOverviewContext();
  const { data } = useSWR(
    `/api/dashboard/overview/info/achievement?${searchParamsToQuery(state.fieldValues)}`,
    swrFetcher
  );

  return (
    <InfoCardStyleContainer title="Achievement" iconName="badgeCheck">
      <InfoCardStyleContent
        info={data ? data.result.count.toFixed(2) : null}
        unit="%"
        caption="Achievement of a goal"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewAchievementInfo;
