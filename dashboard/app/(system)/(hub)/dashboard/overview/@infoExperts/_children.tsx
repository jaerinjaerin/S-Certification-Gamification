'use client';
import InfoCardStyleContainer from '../_components/card-with-title';
import InfoCardStyleContent from '../_components/card-content';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { CampaignSettings } from '@prisma/client';
import { capitalize } from '@/lib/text';
import { swrFetcher } from '@/lib/fetch';

const OverviewExpertsInfoChild = () => {
  const { campaign } = useStateVariables();
  const settings = (campaign as Campaign)?.settings as CampaignSettings;
  const searchParams = useSearchParams();
  const { data } = useSWR(
    `/api/dashboard/overview/info/experts?${searchParams.toString()}&campaign=${campaign?.id}`,
    swrFetcher,
    { fallbackData: { result: { count: null } } }
  );
  const count = data.result?.count;

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
