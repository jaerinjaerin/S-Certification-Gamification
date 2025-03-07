import dynamic from 'next/dynamic';

const UserDomainChild = dynamic(() => import('./_children'), {
  ssr: false,
});
const UserDomain = ({ params }: { params: { campaign: string } }) => {
  return <UserDomainChild />;
};

export default UserDomain;
