import dynamic from 'next/dynamic';

const UserDomainChild = dynamic(() => import('./_children'), {
  ssr: false,
});
const UserDomain = () => {
  return <UserDomainChild />;
};

export default UserDomain;
