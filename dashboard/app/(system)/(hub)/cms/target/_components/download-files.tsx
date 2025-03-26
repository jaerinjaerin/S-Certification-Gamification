'use client';
import { Button } from '@/components/ui/button';
import { useTargetData } from '../_provider/target-data-provider';
import { serializeJsonToQuery } from '@/lib/search-params';
import { useStateVariables } from '@/components/provider/state-provider';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const DownloadTarget = () => {
  const { campaign } = useStateVariables();
  const { state } = useTargetData();
  const [isDownloading, setIsDownloading] = useState(false);

  const onDownload = async () => {
    if (state.targets && campaign) {
      // window.location.href = `/api/cms/target/data?${serializeJsonToQuery({ campaignSlug: campaign.slug })}`;
      try {
        setIsDownloading(true);
        const response = await fetch(
          `/api/cms/target/data?${serializeJsonToQuery({
            campaignSlug: campaign.slug,
          })}`
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'target.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
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
