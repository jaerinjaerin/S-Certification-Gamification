'use client';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { swrFetcher } from '@/lib/fetch';

const OverviewParticipantsInfoChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const { data } = useSWR(
    `/api/dashboard/overview/info/participants?${searchParams.toString()}&campaign=${campaign?.id}`,
    swrFetcher,
    { fallbackData: { result: { count: null } } }
  );
  const count = data.result?.count;

  return (
    <InfoCardStyleContainer title="Participants" iconName="user">
      <InfoCardStyleContent
        info={count?.toLocaleString()}
        caption="Total paricipants"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewParticipantsInfoChild;
