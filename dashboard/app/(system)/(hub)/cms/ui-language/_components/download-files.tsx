'use client';
import { Button } from '@/components/ui/button';
import { useLanguageData } from '../_provider/language-data-provider';
import { serializeJsonToQuery } from '@/lib/search-params';

const DownloadLanguages = () => {
  const { state } = useLanguageData();

  const onDownload = async () => {
    if (state.languages) {
      const keys = state.languages
        .map((l) => (l.excelUrl ? l.excelUrl.slice(1) : ''))
        .filter(Boolean);
      //
      window.location.href = `/api/cms/language/data?${serializeJsonToQuery({ keys })}`;
    }
  };

  return (
    <Button variant="secondary" onClick={onDownload}>
      Download All Data
    </Button>
  );
};

export default DownloadLanguages;
