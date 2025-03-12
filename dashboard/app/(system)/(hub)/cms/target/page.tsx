import { Button } from '@/components/ui/button';
import { DataTable } from './_components/data-table';
import { DownloadFileListPopoverButton } from '../_components/custom-popover';
import SectionTitle from '../_components/section-title-container';
import DownloadTarget from './_components/download-files';
import UploadExcelFileModal from './_components/upload-excel-file-modal';
import { TargetDataProvider } from './_provider/target-data-provider';

export default async function TargetPage() {
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
            <UploadExcelFileModal title="Upload Target">
              <Button variant="action">Upload</Button>
            </UploadExcelFileModal>
          </div>
        </div>
        <DataTable />
      </div>
    </TargetDataProvider>
  );
}
