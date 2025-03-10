'use client';
import { Button } from '@/components/ui/button';
import { serializeJsonToQuery } from '@/lib/search-params';
import { useLanguageData } from '../_provider/language-data-provider';

const DownloadLanguages = () => {
  const { state } = useLanguageData();

  const onDownload = async () => {
    console.log('state:', state);
    if (state.languages) {
      const keys = state.languages
        // .map((l) => (l.excelUrl ? l.excelUrl.slice(1) : ''))
        .map((l) => (l.file ? l.file.path.slice(1) : ''))
        .filter(Boolean);

      console.log('keys:', keys);
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
