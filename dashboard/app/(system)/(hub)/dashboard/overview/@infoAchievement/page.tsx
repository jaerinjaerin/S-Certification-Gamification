'use client';
import { useStateVariables } from '@/components/provider/state-provider';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useOverviewContext } from '../_provider/provider';
import useSWR from 'swr';
import { getAchievementRate } from '@/app/actions/dashboard/overview/achievement-action';

const OverviewAchievementInfo = () => {
  const { campaign } = useStateVariables();
  const { state } = useOverviewContext();
  const { data: count } = useSWR(
    { key: 'getAchievementRate', ...state.fieldValues, campaign: campaign?.id },
    getAchievementRate
  );
  // const { data } = useSWR(
  //   `/api/dashboard/overview/info/achievement?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id })}`,
  //   swrFetcher
  // );

  return (
    <InfoCardStyleContainer title="Achievement" iconName="badgeCheck">
      <InfoCardStyleContent
        info={count ? count.toFixed(2) : null}
        unit="%"
        caption="Achievement of a goal"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewAchievementInfo;
