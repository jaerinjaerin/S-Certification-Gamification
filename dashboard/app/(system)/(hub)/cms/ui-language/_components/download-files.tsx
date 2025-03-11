'use client';
import { Button } from '@/components/ui/button';
import { serializeJsonToQuery } from '@/lib/search-params';
import { toast } from 'sonner';
import { isEmpty } from '../../_utils/utils';
import { useLanguageData } from '../_provider/language-data-provider';

const DownloadLanguages = () => {
  const { state } = useLanguageData();

  const onDownload = async () => {
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
      window.location.href = `/api/cms/language/data?${serializeJsonToQuery({ keys })}`;
    }
  };

  if (!state.languages || state.languages.length === 0) {
    return <> </>;
  }

  return (
    <Button variant="secondary" onClick={onDownload}>
      Download All Data
    </Button>
  );
};

export default DownloadLanguages;
