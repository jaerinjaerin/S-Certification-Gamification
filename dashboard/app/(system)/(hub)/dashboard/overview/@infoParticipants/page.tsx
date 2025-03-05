'use client';
import { useStateVariables } from '@/components/provider/state-provider';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useOverviewContext } from '../_provider/provider';
import useSWR from 'swr';
import { getParticipantCount } from '@/app/actions/dashboard/overview/participant-action';

const OverviewParticipantsInfo = () => {
  const { campaign } = useStateVariables();
  const { state } = useOverviewContext();
  const { data: count } = useSWR(
    {
      key: 'getParticipantCount',
      ...state.fieldValues,
      campaign: campaign?.id,
    },
    getParticipantCount
  );
  // const { data } = useSWR(
  //   `/api/dashboard/overview/info/participants?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id })}`,
  //   swrFetcher
  // );

  return (
    <InfoCardStyleContainer title="Participants" iconName="user">
      <InfoCardStyleContent info={count ?? null} caption="Total paricipants" />
    </InfoCardStyleContainer>
  );
};

export default OverviewParticipantsInfo;
