import { Button } from '@/components/ui/button';
import axios from 'axios';
import { serializeJsonToQuery } from '@/lib/search-params';
import { DataTable } from './_components/data-table';
import { DownloadFileListPopoverButton } from '../_components/custom-popover';
import SectionTitle from '../_components/section-title-container';
import DownloadTarget from './_components/download-files';
import UploadExcelFileModal from './_components/upload-excel-file-modal';
import { TargetDataProvider } from './_provider/target-data-provider';

export default async function TargetPage({
  searchParams,
}: {
  searchParams: JsonObject;
}) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/cms/target?${serializeJsonToQuery(searchParams)}`
  );
  const data = response.data.result as TargetProps[];

  return (
    <TargetDataProvider>
      <div className="absolute top-0 right-0 ">
        <DownloadFileListPopoverButton type="template" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionTitle>Set Target</SectionTitle>
          <div className="flex space-x-3">
            <DownloadTarget />
            <UploadExcelFileModal title="Upload Target" variant="target">
              <Button variant="action">Upload</Button>
            </UploadExcelFileModal>
          </div>
        </div>
        <div className="border rounded-md">
          <DataTable data={data} />
        </div>
      </div>
    </TargetDataProvider>
  );
}
