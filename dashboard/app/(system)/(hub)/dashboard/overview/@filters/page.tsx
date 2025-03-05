/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Filters from '@/app/(system)/(hub)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { useOverviewContext } from '../_provider/provider';
import { updateSearchParamsOnUrl } from '@/lib/url';
import { useStateVariables } from '@/components/provider/state-provider';
import { downloadOverview } from '@/app/actions/dashboard/overview/overview-download-action';
import { downloadFileByBase64 } from '@/lib/download';

const OverviewFilterForm = () => {
  const { campaign } = useStateVariables();
  const { dispatch } = useOverviewContext();

  const onSubmit = (formData: FieldValues, action?: boolean) => {
    // 서치파람 업데이트
    updateSearchParamsOnUrl(formData);
    //
    dispatch({ type: 'SET_FIELD_VALUES', payload: formData });
  };

  const onDownload = async (formData: FieldValues) => {
    try {
      if (formData && campaign) {
        const result = await downloadOverview({
          ...formData,
          campaign: campaign.id,
        });

        if (!result || !result.base64) {
          console.error('Download failed');
          return;
        }

        downloadFileByBase64(result);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return <Filters onSubmit={onSubmit} onDownload={onDownload} />;
};

export default OverviewFilterForm;
