import { redirect } from 'next/navigation';

const DashboardWithParams = () => {
  redirect(`/dashboard/overview`);
  return null;
};

export default DashboardWithParams;
