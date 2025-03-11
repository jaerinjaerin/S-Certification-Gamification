import dynamic from 'next/dynamic';

const OverviewExpertsChild = dynamic(() => import('./_children'), {
  ssr: false,
});
const OverviewExperts = () => {
  return <OverviewExpertsChild />;
};

export default OverviewExperts;
