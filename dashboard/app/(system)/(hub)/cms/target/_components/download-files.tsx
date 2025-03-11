'use client';
import { Button } from '@/components/ui/button';
import { useTargetData } from '../_provider/target-data-provider';
import { serializeJsonToQuery } from '@/lib/search-params';
import { useStateVariables } from '@/components/provider/state-provider';

const DownloadTarget = () => {
  const { campaign } = useStateVariables();
  const { state } = useTargetData();

  const onDownload = async () => {
    if (state.targets && campaign) {
      window.location.href = `/api/cms/target/data?${serializeJsonToQuery({ campaignName: campaign.name })}`;
    }
  };

  return (
    <Button variant="secondary" onClick={onDownload}>
      Download Data
    </Button>
  );
};

export default DownloadTarget;
