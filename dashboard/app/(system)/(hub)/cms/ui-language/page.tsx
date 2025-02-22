import { Button } from '@/components/ui/button';
import axios from 'axios';
import { serializeJsonToQuery } from '@/lib/search-params';
import { DataTable } from './_components/data-table';
import { LanguageDataProvider } from './_provider/language-data-provider';
import UploadExcelFileModal from './_components/upload-excel-file-modal';
import { DownloadFileListPopoverButton } from '../_components/custom-popover';
import SectionTitle from '../_components/section-title-container';
import DownloadLanguages from './_components/download-files';

export default async function UILanguagePage({
  searchParams,
}: {
  searchParams: JsonObject;
}) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/cms/language?${serializeJsonToQuery(searchParams)}`
  );
  const data = response.data.result as LanguageProps[];

  return (
    <LanguageDataProvider>
      <div className="absolute top-0 right-0 ">
        <DownloadFileListPopoverButton type="template" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionTitle>UI Language List</SectionTitle>
          <div className="flex space-x-3">
            <DownloadLanguages />
            <UploadExcelFileModal title="Upload UI Language" variant="ui">
              <Button variant="action">Upload</Button>
            </UploadExcelFileModal>
          </div>
        </div>
        <div className="border rounded-md">
          <DataTable data={data} />
        </div>
      </div>
    </LanguageDataProvider>
  );
}
