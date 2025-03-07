'use client';
import InfoCardStyleContainer from '../_components/card-with-title';
import { getExpertByGroup } from '@/app/actions/dashboard/overview/expert-action';
import { LoaderWithBackground } from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import { searchParamsToJson } from '@/lib/query';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

const OverviewExpertsByGroupInfoChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const { data, isLoading } = useSWR(
    {
      ...searchParamsToJson(searchParams),
      key: 'getExpertByGroup',
      campaign: campaign?.id,
    },
    getExpertByGroup
  );

  return (
    <InfoCardStyleContainer title="Experts by group" iconName="users">
      {isLoading && <LoaderWithBackground />}
      {data?.map((groupData) => {
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
      })}
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsByGroupInfoChild;
