import dynamic from 'next/dynamic';

const UserOutcomeChild = dynamic(() => import('./_children'), {
  ssr: false,
});
const UserOutcome = () => {
  return <UserOutcomeChild />;
};

export default UserOutcome;
