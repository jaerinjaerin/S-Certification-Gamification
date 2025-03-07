import { redirect } from 'next/navigation';

const DashboardWithParams = ({ params }: { params: { campaign: string } }) => {
  redirect(`/dashboard/${params.campaign}/overview`);
  return null;
};

export default DashboardWithParams;
