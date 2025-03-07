import dynamic from 'next/dynamic';

const OverviewAchievementRateChild = dynamic(() => import('./_children'), {
  ssr: false,
});
const OverviewAchievementRate = () => {
  return <OverviewAchievementRateChild />;
};

export default OverviewAchievementRate;
