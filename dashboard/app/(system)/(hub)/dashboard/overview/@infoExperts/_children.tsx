'use client';
import InfoCardStyleContainer from '../_components/card-with-title';
import InfoCardStyleContent from '../_components/card-content';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { CampaignSettings } from '@prisma/client';
import { capitalize } from '@/lib/text';
import { swrFetcher } from '@/lib/fetch';
import { useMemo } from 'react';

const OverviewExpertsInfoChild = () => {
  const { campaign } = useStateVariables();
  const settings = (campaign as Campaign)?.settings as CampaignSettings;
  const searchParams = useSearchParams();
  const fallbackData = useMemo(() => ({ result: { count: null } }), []);
  const swrKey = useMemo(() => {
    return `/api/dashboard/overview/info/experts?${searchParams.toString()}&campaign=${campaign?.id}`;
  }, [searchParams, campaign?.id]);

  const { data } = useSWR(swrKey, swrFetcher, {
    revalidateOnFocus: false,
    fallbackData,
  });

  const count = useMemo(() => data.result?.count, [data]);

  return (
    <InfoCardStyleContainer
      title={`${capitalize(settings?.firstBadgeName || 'Expert')}s`}
      iconName="userCheck"
    >
      <InfoCardStyleContent
        info={count?.toLocaleString()}
        caption={`Total ${settings?.firstBadgeName || 'Expert'}s users`}
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsInfoChild;
