/* eslint-disable @typescript-eslint/no-explicit-any */
import { getExpertsData } from '@/app/actions/dashboard/overview/expert-action';
import OverviewExpertsChild from './_children';
import { URLSearchParams } from 'url';

const OverviewExperts = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  const data = await getExpertsData(searchParams);

  return <OverviewExpertsChild data={data} />;
};

export default OverviewExperts;
