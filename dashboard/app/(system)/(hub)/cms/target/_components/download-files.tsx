'use client';
import { Button } from '@/components/ui/button';
import { useTargetData } from '../_provider/target-data-provider';
import { serializeJsonToQuery } from '@/lib/search-params';

const DownloadTarget = () => {
  const { state } = useTargetData();

  const onDownload = async () => {
    if (state.targets) {
      window.location.href = `/api/cms/target/data?${serializeJsonToQuery({})}`;
    }
  };

  return (
    <Button variant="secondary" onClick={onDownload}>
      Download All Data
    </Button>
  );
};

export default DownloadTarget;
