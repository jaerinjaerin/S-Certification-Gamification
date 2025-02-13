'use client';

import { useEffect, useState } from 'react';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useOverviewContext } from '../_provider/provider';
import { fetchData } from '../../_lib/fetch';
import { useAbortController } from '@/components/hook/use-abort-controller';

const OverviewAchievementInfo = () => {
  const { createController, abort } = useAbortController();
  const { state } = useOverviewContext();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        'overview/info/achievement',
        (data) => {
          setCount(data.result.count.toFixed(2) ?? 0);
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
    <InfoCardStyleContainer title="Achievement" iconName="badgeCheck">
      <InfoCardStyleContent
        info={count}
        unit="%"
        caption="Achievement of a goal"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewAchievementInfo;
