import { redirect } from 'next/navigation';

const OverviewBoard = ({ params }: { params: { campaign: string } }) => {
  redirect(`/dashboard/${params.campaign}/overview`);
  return null;
};

export default OverviewBoard;
