/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Filters from '@/app/(system)/(hub)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { transformFormData } from '@/lib/url';
import { usePathname, useRouter } from 'next/navigation';
import { useStateVariables } from '@/components/provider/state-provider';
import { updateCampaignId } from '../../../_lib/text';

const QuizFilterForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { campaign } = useStateVariables();
  const onSubmit = (formData: FieldValues, action?: boolean) => {
    if (campaign) {
      const url = updateCampaignId({ pathname, campaignId: campaign.id });
      router.replace(`${url}?${transformFormData(formData)}`);
    }
  };

  return <Filters onSubmit={onSubmit} />;
};

export default QuizFilterForm;
