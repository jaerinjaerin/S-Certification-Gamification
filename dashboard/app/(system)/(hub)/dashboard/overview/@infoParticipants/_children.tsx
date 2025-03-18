'use client';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { swrFetcher } from '@/lib/fetch';
import { useMemo } from 'react';

const OverviewParticipantsInfoChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const fallbackData = useMemo(() => ({ result: { count: null } }), []);
  const swrKey = useMemo(() => {
    return `/api/dashboard/overview/info/participants?${searchParams.toString()}&campaign=${campaign?.id}`;
  }, [searchParams, campaign?.id]);
  const { data } = useSWR(swrKey, swrFetcher, {
    revalidateOnFocus: false,
    fallbackData,
  });
  const count = useMemo(() => data.result?.count, [data]);

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
