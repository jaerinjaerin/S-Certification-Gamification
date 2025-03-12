import { redirect } from 'next/navigation';

const UserBoard = () => {
  redirect(`/dashboard/user/stats`);
  return null;
};

export default UserBoard;
