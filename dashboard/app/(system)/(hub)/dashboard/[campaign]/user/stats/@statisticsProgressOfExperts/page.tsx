import dynamic from 'next/dynamic';

const UserProgressExpertsChild = dynamic(() => import('./_children'), {
  ssr: false,
});
export const UserProgressExperts = () => {
  return <UserProgressExpertsChild />;
};

export default UserProgressExperts;
