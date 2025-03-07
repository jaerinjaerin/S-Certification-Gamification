/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Filters from '@/app/(system)/(hub)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { useStateVariables } from '@/components/provider/state-provider';
import { downloadOverview } from '@/app/actions/dashboard/overview/overview-download-action';
import { downloadFileByBase64 } from '@/lib/download';
import { usePathname, useRouter } from 'next/navigation';
import { transformFormData } from '@/lib/url';
import { updateCampaignId } from '../../../_lib/text';

const OverviewFilterForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { campaign } = useStateVariables();

  const onSubmit = (formData: FieldValues, action?: boolean) => {
    if (campaign) {
      const url = updateCampaignId({ pathname, campaignId: campaign.id });
      router.replace(`${url}?${transformFormData(formData)}`);
    }
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
