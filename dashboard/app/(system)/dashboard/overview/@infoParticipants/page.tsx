'use client';

import { useEffect, useState } from 'react';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { useOverviewContext } from '../_provider/provider';
import { fetchData } from '../../_lib/fetch';
import { useAbortController } from '@/components/hook/use-abort-controller';

const OverviewParticipantsInfo = () => {
  const { createController, abort } = useAbortController();
  const { state } = useOverviewContext();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        'dashboard/overview/info/participants',
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
    <InfoCardStyleContainer title="Participants" iconName="user">
      <InfoCardStyleContent info={count} caption="Total paricipants" />
    </InfoCardStyleContainer>
  );
};

export default OverviewParticipantsInfo;
