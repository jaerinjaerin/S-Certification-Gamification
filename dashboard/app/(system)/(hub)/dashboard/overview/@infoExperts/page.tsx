import dynamic from 'next/dynamic';

const OverviewExpertsInfoChild = dynamic(() => import('./_children'), {
  ssr: false,
});
const OverviewExpertsInfo = () => {
  return <OverviewExpertsInfoChild />;
};

export default OverviewExpertsInfo;
