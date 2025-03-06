import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { getAchievementRate } from '@/app/actions/dashboard/overview/achievement-action';
import { URLSearchParams } from 'url';

const OverviewAchievementInfo = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  const count = await getAchievementRate(searchParams);

  return (
    <InfoCardStyleContainer title="Achievement" iconName="badgeCheck">
      <InfoCardStyleContent
        info={count.toFixed(2)}
        unit="%"
        caption="Achievement of a goal"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewAchievementInfo;
