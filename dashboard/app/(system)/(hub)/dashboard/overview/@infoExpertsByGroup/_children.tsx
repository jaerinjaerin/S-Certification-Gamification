'use client';
import InfoCardStyleContainer from '../_components/card-with-title';
import { LoaderWithBackground } from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import { swrFetcher } from '@/lib/fetch';
import { capitalize } from '@/lib/text';
import { CampaignSettings } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

const OverviewExpertsByGroupInfoChild = () => {
  const { campaign } = useStateVariables();
  const settings = (campaign as Campaign).settings as CampaignSettings;
  const searchParams = useSearchParams();
  const { data: groupedExperts, isLoading } = useSWR(
    `/api/dashboard/overview/info/experts-by-group?${searchParams.toString()}&campaign=${campaign?.id}`,
    swrFetcher,
    {
      fallbackData: {
        result: [
          {
            group: 'plus',
            items: [
              { title: 'ff', value: 0 },
              { title: 'fsm', value: 0 },
            ],
          },
          {
            group: 'ses',
            items: [
              { title: 'ff', value: 0 },
              { title: 'fsm', value: 0 },
            ],
          },
        ],
      },
    }
  );
  // const count = data.result?.count;
  const data = groupedExperts.result;

  return (
    <InfoCardStyleContainer
      title={`${capitalize(settings?.firstBadgeName || 'Expert')}s by group`}
      iconName="users"
    >
      {isLoading && <LoaderWithBackground />}
      {data?.map(
        (groupData: {
          group: string;
          items: { title: string; value: number }[];
        }) => {
          const groupSuffix =
            groupData.group === 'plus' ? '' : `(${groupData.group})`;
          return (
            <div
              key={groupData.group}
              className="text-zinc-950 font-medium flex space-x-6"
            >
              {groupData.items.map((item) => {
                const title = `${item.title}${groupSuffix}`;
                return (
                  <div key={title} className="flex items-center space-x-1">
                    <div className="uppercase">{title}</div>
                    <div className="font-bold text-size-20px">
                      {item.value.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }
      )}
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsByGroupInfoChild;
