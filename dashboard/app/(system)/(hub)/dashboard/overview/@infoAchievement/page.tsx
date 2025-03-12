import dynamic from 'next/dynamic';

const OverviewAchievementInfoChild = dynamic(() => import('./_children'), {
  ssr: false,
});
const OverviewAchievementInfo = () => {
  return <OverviewAchievementInfoChild />;
};

export default OverviewAchievementInfo;
