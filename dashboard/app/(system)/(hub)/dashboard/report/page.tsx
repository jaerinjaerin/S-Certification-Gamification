import { redirect } from 'next/navigation';

const Report = () => {
  redirect('/dashboard/report/user');
  return null;
};

export default Report;
