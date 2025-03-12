import { getCampaign } from '@/app/actions/campaign-action';
import { headers } from 'next/headers';

export const getSearchParams = () => {
  const url = new URL(headers().get('x-current-url')!);
  // searchParams가 URLSearchParams인지 확인
  if (!(url.searchParams instanceof URLSearchParams)) {
    return new URLSearchParams(url.searchParams as any);
  }
  return url.searchParams;
};

// 대시보드에서 slot마다 일괄적 사용
export const getSearchParamsForAction = async (params: {
  campaign: string;
}) => {
  const searchParams = getSearchParams();
  if (!searchParams.get('date.from')) {
    const { result: campaign } = await getCampaign(params.campaign);

    if (campaign) {
      searchParams.set('date.from', campaign.startedAt.toISOString());
      searchParams.set('date.to', campaign.endedAt.toISOString());
      searchParams.set('campaign', campaign.id);
    }
  }
  if (!searchParams.get('campaign'))
    searchParams.set('campaign', params.campaign);

  return searchParams;
};
