/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Filters from '@/app/(system)/(hub)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { useOverviewContext } from '../_provider/provider';
import { updateSearchParamsOnUrl } from '@/lib/url';
import { serializeJsonToQuery } from '@/lib/search-params';
import { useStateVariables } from '@/components/provider/state-provider';

const OverviewFilterForm = () => {
  const { campaign } = useStateVariables();
  const { dispatch } = useOverviewContext();

  const onSubmit = (formData: FieldValues, action?: boolean) => {
    // 서치파람 업데이트
    updateSearchParamsOnUrl(formData);
    //
    dispatch({ type: 'SET_FIELD_VALUES', payload: formData });
  };

  const onDownload = (formData: FieldValues) => {
    if (formData && campaign) {
      const params = serializeJsonToQuery({
        ...formData,
        campaignId: campaign.id,
      });
      const url = `/api/dashboard/overview/download?${params.toString()}`;
      window.location.href = url;
    }
  };

  return <Filters onSubmit={onSubmit} onDownload={onDownload} />;
};

export default OverviewFilterForm;
