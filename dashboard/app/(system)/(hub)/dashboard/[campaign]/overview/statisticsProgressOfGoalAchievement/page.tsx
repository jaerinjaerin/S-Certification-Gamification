import { getAchievementGoalProgress } from '@/app/actions/dashboard/overview/achievement-action';
import OverviewGoalAchievementChild from './_children';
import { URLSearchParams } from 'url';

export const OverviewGoalAchievement = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  if (!(searchParams instanceof URLSearchParams)) {
    searchParams = new URLSearchParams(searchParams as any);
  }
  const data = await getAchievementGoalProgress(searchParams);

  return <OverviewGoalAchievementChild progressData={data} />;
};

export default OverviewGoalAchievement;
