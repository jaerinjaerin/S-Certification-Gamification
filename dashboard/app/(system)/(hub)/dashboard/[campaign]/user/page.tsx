import { redirect } from 'next/navigation';

const UserBoard = ({ params }: { params: { campaign: string } }) => {
  redirect(`/dashboard/${params.campaign}/user/stats`);
  return null;
};

export default UserBoard;
