'use client';
import { Button } from '@/components/ui/button';
import { useTargetData } from '../_provider/target-data-provider';
import { serializeJsonToQuery } from '@/lib/search-params';
import { useStateVariables } from '@/components/provider/state-provider';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { handleDownload } from '../../_utils/utils';

const DownloadTarget = () => {
  const { campaign } = useStateVariables();
  const { state } = useTargetData();
  const [isDownloading, setIsDownloading] = useState(false);

  const onDownload = async () => {
    if (state.targets && campaign) {
      // window.location.href = `/api/cms/target/data?${serializeJsonToQuery({ campaignSlug: campaign.slug })}`;
      try {
        setIsDownloading(true);

        await handleDownload(
          `target-${campaign.slug}.xlsx`,
          `/api/cms/target/data?${serializeJsonToQuery({ campaignSlug: campaign.slug })}`
        );
      } catch (error) {
        console.error('Download failed:', error);
        toast.error('Download failed');
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <Button variant="secondary" onClick={onDownload} disabled={isDownloading}>
      Download Data
      {isDownloading && <Loader2 className="w-4 h-4 animate-spin" />}
    </Button>
  );
};

export default DownloadTarget;
