/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Filters from '@/app/(system)/(hub)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { useStateVariables } from '@/components/provider/state-provider';
import { downloadOverview } from '@/app/actions/dashboard/overview-download-action';
import { downloadFileByBase64 } from '@/lib/download';
import { updateSearchParamsOnUrl } from '@/lib/url';

const OverviewFilterForm = () => {
  const { campaign } = useStateVariables();

  const onSubmit = (formData: FieldValues, action?: boolean) => {
    updateSearchParamsOnUrl(formData);
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
