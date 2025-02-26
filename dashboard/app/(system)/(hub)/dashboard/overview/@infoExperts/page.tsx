'use client';
import InfoCardStyleContent from '@/app/(system)/(hub)/dashboard/overview/_components/card-content';
import InfoCardStyleContainer from '@/app/(system)/(hub)/dashboard/overview/_components/card-with-title';
import { useOverviewContext } from '@/app/(system)/(hub)/dashboard/overview/_provider/provider';
import { getExpertCount } from '@/app/actions/dashboard/overview/expert-action';
import { useStateVariables } from '@/components/provider/state-provider';
import useSWR from 'swr';

const OverviewExpertsInfo = () => {
  const { campaign } = useStateVariables();
  const { state } = useOverviewContext();
  const { data: count } = useSWR(
    { key: 'getExpertCount', ...state.fieldValues, campaign: campaign?.id },
    getExpertCount
  );
  // const { data } = useSWR(
  //   `/api/dashboard/overview/info/experts?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id })}`,
  //   swrFetcher
  // );

  return (
    <InfoCardStyleContainer title="Experts" iconName="userCheck">
      <InfoCardStyleContent info={count ?? null} caption="Total expert users" />
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsInfo;
