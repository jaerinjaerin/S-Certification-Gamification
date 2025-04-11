'use client';
import { Button } from '@/components/ui/button';
import { serializeJsonToQuery } from '@/lib/search-params';
import { toast } from 'sonner';
import { isEmpty } from '../../_utils/utils';
import { useLanguageData } from '../_provider/language-data-provider';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const DownloadLanguages = () => {
  const { state } = useLanguageData();
  const [isDownloading, setIsDownloading] = useState(false);

  const onDownload = async () => {
    setIsDownloading(true);
    console.log('state:', state);
    if (isEmpty(state.languages)) {
      toast.warning('No data to download');
      return;
    }
    if (state.languages) {
      const keys = state.languages
        // .map((l) => (l.excelUrl ? l.excelUrl.slice(1) : ''))
        .map((l) => (l.file ? l.file.path.slice(1) : ''))
        .filter(Boolean);

      console.log('keys:', keys);
      //
      // window.location.href = `/api/cms/language/data?${serializeJsonToQuery({ keys })}`;
      try {
        const response = await fetch(
          `/api/cms/language/data?${serializeJsonToQuery({ keys })}`
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ui-languages.zip'; // 원하는 파일 이름으로 변경 가능
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        toast.error('Download failed');
      }
    }
    setIsDownloading(false);
  };

  if (!state.languages || state.languages.length === 0) {
    return <> </>;
  }

  return (
    <Button variant="secondary" onClick={onDownload} disabled={isDownloading}>
      Download All Data{' '}
      {isDownloading && <Loader2 className="w-4 h-4 animate-spin" />}
    </Button>
  );
};

export default DownloadLanguages;
