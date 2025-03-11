import dynamic from 'next/dynamic';

const OverviewGoalAchievementChild = dynamic(() => import('./_children'), {
  ssr: false,
});
export const OverviewGoalAchievement = () => {
  return <OverviewGoalAchievementChild />;
};

export default OverviewGoalAchievement;
