import dynamic from 'next/dynamic';

const OverviewParticipantsInfoChild = dynamic(() => import('./_children'), {
  ssr: false,
});
const OverviewParticipantsInfo = () => {
  return <OverviewParticipantsInfoChild />;
};

export default OverviewParticipantsInfo;
