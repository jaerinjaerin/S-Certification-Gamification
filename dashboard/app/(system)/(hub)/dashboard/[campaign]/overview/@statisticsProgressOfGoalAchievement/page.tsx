import { getAchievementGoalProgress } from '@/app/actions/dashboard/overview/achievement-action';
import OverviewGoalAchievementChild from './_children';
import { URLSearchParams } from 'url';

export const OverviewGoalAchievement = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  const data = await getAchievementGoalProgress(searchParams);

  return <OverviewGoalAchievementChild progressData={data} />;
};

export default OverviewGoalAchievement;
