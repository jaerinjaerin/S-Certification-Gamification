'use client';

import { useEffect, useState } from 'react';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useOverviewContext } from '../_provider/provider';
import { initialExpertsData } from './_lib/state';
import { fetchData } from '../../_lib/fetch';
import { LoaderWithBackground } from '@/components/loader';

const OverviewExpertsByGroupInfo = () => {
  const { state } = useOverviewContext();
  const [expertData, setExpertData] =
    useState<ImprovedDataStructure>(initialExpertsData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(state.fieldValues, 'overview/info/experts-by-group', (data) => {
        setExpertData(data.result ?? initialExpertsData);
        setLoading(false);
      });
    }
    return () => {
      setLoading(true);
    };
  }, [state.fieldValues]);

  return (
    <InfoCardStyleContainer title="Experts by group" iconName="users">
      {loading && <LoaderWithBackground />}
      {expertData.map((groupData) => {
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
