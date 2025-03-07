'use client';
import { getExpertCount } from '@/app/actions/dashboard/overview/expert-action';
import InfoCardStyleContainer from '../_components/card-with-title';
import InfoCardStyleContent from '../_components/card-content';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { searchParamsToJson } from '@/lib/query';

const OverviewExpertsInfoChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const { data: count } = useSWR(
    {
      ...searchParamsToJson(searchParams),
      key: 'getExpertCount',
      campaign: campaign?.id,
    },
    getExpertCount
  );

  return (
    <InfoCardStyleContainer title="Experts" iconName="userCheck">
      <InfoCardStyleContent
        info={count?.toString()}
        caption="Total expert users"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsInfoChild;
