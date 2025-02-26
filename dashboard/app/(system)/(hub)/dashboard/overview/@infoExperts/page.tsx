'use client';
import InfoCardStyleContent from '@/app/(system)/(hub)/dashboard/overview/_components/card-content';
import InfoCardStyleContainer from '@/app/(system)/(hub)/dashboard/overview/_components/card-with-title';
import { useOverviewContext } from '@/app/(system)/(hub)/dashboard/overview/_provider/provider';
import { useStateVariables } from '@/components/provider/state-provider';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import useSWR from 'swr';

const OverviewExpertsInfo = () => {
  const { campaign } = useStateVariables();
  const { state } = useOverviewContext();
  const { data } = useSWR(
    `/api/dashboard/overview/info/experts?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id })}`,
    swrFetcher
  );

  return (
    <InfoCardStyleContainer title="Experts" iconName="userCheck">
      <InfoCardStyleContent
        info={data ? data.result.count : null}
        caption="Total expert users"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsInfo;
