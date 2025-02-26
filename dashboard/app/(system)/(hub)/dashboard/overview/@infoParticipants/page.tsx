'use client';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useOverviewContext } from '../_provider/provider';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import useSWR from 'swr';

const OverviewParticipantsInfo = () => {
  const { state } = useOverviewContext();
  const { data } = useSWR(
    `/api/dashboard/overview/info/participants?${searchParamsToQuery(state.fieldValues)}`,
    swrFetcher
  );

  return (
    <InfoCardStyleContainer title="Participants" iconName="user">
      <InfoCardStyleContent
        info={data ? data.result.count : null}
        caption="Total paricipants"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewParticipantsInfo;
