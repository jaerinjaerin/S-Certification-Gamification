'use client';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useOverviewContext } from '../_provider/provider';
import { initialExpertsData } from './_lib/state';
import { LoaderWithBackground } from '@/components/loader';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import useSWR from 'swr';
import { useStateVariables } from '@/components/provider/state-provider';

const OverviewExpertsByGroupInfo = () => {
  const { campaign } = useStateVariables();
  const { state } = useOverviewContext();
  const { data, isLoading: loading } = useSWR(
    `/api/dashboard/overview/info/experts-by-group?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id })}`,
    swrFetcher
  );
  const { result: improvedData } = data || { result: initialExpertsData };

  return (
    <InfoCardStyleContainer title="Experts by group" iconName="users">
      {loading && <LoaderWithBackground />}
      {(improvedData as ImprovedDataStructure).map((groupData) => {
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

export default OverviewExpertsByGroupInfo;
