import { getExpertCount } from '@/app/actions/dashboard/overview/expert-action';
import InfoCardStyleContainer from '../_components/card-with-title';
import InfoCardStyleContent from '../_components/card-content';
import { URLSearchParams } from 'url';

const OverviewExpertsInfo = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  if (!(searchParams instanceof URLSearchParams)) {
    searchParams = new URLSearchParams(searchParams as any);
  }
  const count = await getExpertCount(searchParams);

  return (
    <InfoCardStyleContainer title="Experts" iconName="userCheck">
      <InfoCardStyleContent info={count} caption="Total expert users" />
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsInfo;
