'use client';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { getParticipantCount } from '@/app/actions/dashboard/overview/participant-action';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { searchParamsToJson } from '@/lib/query';
import { LoaderWithBackground } from '@/components/loader';

const OverviewParticipantsInfoChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const { data: count, isLoading } = useSWR(
    {
      ...searchParamsToJson(searchParams),
      key: 'getParticipantCount',
      campaign: campaign?.id,
    },
    getParticipantCount
  );

  return (
    <InfoCardStyleContainer title="Participants" iconName="user">
      {isLoading && <LoaderWithBackground />}
      <InfoCardStyleContent
        info={count?.toString()}
        caption="Total paricipants"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewParticipantsInfoChild;
