import { redirect } from 'next/navigation';

const OverviewBoard = (params: { campaign: string }) => {
  redirect(`/dashboard/${params.campaign}/overview`);
};

export default OverviewBoard;
