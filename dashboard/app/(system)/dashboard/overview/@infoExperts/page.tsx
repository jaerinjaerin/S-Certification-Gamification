'use client';

import { useEffect, useState } from 'react';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useOverviewContext } from '../_provider/provider';
import { fetchData } from '../../_lib/fetch';

const OverviewExpertsInfo = () => {
  const { state } = useOverviewContext();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(state.fieldValues, 'overview/info/experts', (data) => {
        setCount(data.result.count ?? 0);
      });
    }

    return () => {
      setCount(null);
    };
  }, [state.fieldValues]);

  return (
    <InfoCardStyleContainer title="Experts" iconName="userCheck">
      <InfoCardStyleContent info={count} caption="Total expert users" />
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsInfo;
