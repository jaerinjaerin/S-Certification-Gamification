'use client';
import { getExpertCount } from '@/app/actions/dashboard/overview/expert-action';
import InfoCardStyleContainer from '../_components/card-with-title';
import InfoCardStyleContent from '../_components/card-content';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { searchParamsToJson } from '@/lib/query';
import { CampaignSettings } from '@prisma/client';
import { capitalize } from '@/lib/text';

const OverviewExpertsInfoChild = () => {
  const { campaign } = useStateVariables();
  const settings = (campaign as Campaign).settings as CampaignSettings;
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
    <InfoCardStyleContainer
      title={`${capitalize(settings?.firstBadgeName || 'Expert')}s`}
      iconName="userCheck"
    >
      <InfoCardStyleContent
        info={count?.toString()}
        caption={`Total ${settings?.firstBadgeName || 'Expert'}s users`}
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsInfoChild;
