'use client';
import Filters from '@/app/(system)/(hub)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { transformFormData } from '@/lib/url';
import { useStateVariables } from '@/components/provider/state-provider';
import { usePathname, useRouter } from 'next/navigation';
import { updateCampaignId } from '../../../_lib/text';

const UserFilterForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { campaign } = useStateVariables();
  const onSubmit = (formData: FieldValues, action?: boolean) => {
    if (campaign) {
      const url = updateCampaignId({ pathname, campaignId: campaign.id });

      router.replace(
        `${url}?${transformFormData(
          action
            ? {
                ...formData,
                domainPageIndex: 1,
                progressPageIndex: 1,
                usersPageIndex: 1,
              }
            : formData
        )}`
      );
    }
  };

  return <Filters onSubmit={onSubmit} />;
};

export default UserFilterForm;
