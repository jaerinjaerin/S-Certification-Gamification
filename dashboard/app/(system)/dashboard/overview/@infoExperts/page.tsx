'use client';

import { useEffect, useState } from 'react';
import InfoCardStyleContent from '@/app/(system)/dashboard/overview/_components/card-content';
import InfoCardStyleContainer from '@/app/(system)/dashboard/overview/_components/card-with-title';
import { useOverviewContext } from '@/app/(system)/dashboard/overview/_provider/provider';
import { useAbortController } from '@/components/hook/use-abort-controller';
import { fetchData } from '@/lib/fetch';

const OverviewExpertsInfo = () => {
  const { createController, abort } = useAbortController();

  const { state } = useOverviewContext();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        'dashboard/overview/info/experts',
        (data) => {
          setCount(data.result.count ?? 0);
        },
        createController()
      );
    }

    return () => {
      abort();
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
