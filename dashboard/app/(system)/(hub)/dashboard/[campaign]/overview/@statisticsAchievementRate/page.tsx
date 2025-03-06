import {
  getAchievementProgress,
  getAchievementRate,
} from '@/app/actions/dashboard/overview/achievement-action';
import OverviewAchievementRateChild from './_children';
import { URLSearchParams } from 'url';

const OverviewAchievementRate = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  const [data, count] = await Promise.all([
    getAchievementProgress(searchParams),
    getAchievementRate(searchParams),
  ]);

  return <OverviewAchievementRateChild data={data} count={count} />;
};

export default OverviewAchievementRate;
