import dynamic from 'next/dynamic';

const OverviewExpertsByGroupInfoChild = dynamic(() => import('./_children'), {
  ssr: false,
});
const OverviewExpertsByGroupInfo = () => {
  return <OverviewExpertsByGroupInfoChild />;
};

export default OverviewExpertsByGroupInfo;
