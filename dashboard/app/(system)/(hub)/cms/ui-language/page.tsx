import { Button } from '@/components/ui/button';
import { DownloadFileListPopoverButton } from '../_components/custom-popover';
import SectionTitle from '../_components/section-title-container';
import { UiLanguageDataTable } from './_components/data-table-v2';
import DownloadLanguages from './_components/download-files';
import UploadExcelFileModal from './_components/upload-excel-file-modal';
import { LanguageDataProvider } from './_provider/language-data-provider';

export default async function UILanguagePage() {
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
            <UploadExcelFileModal title="Upload UI Language">
              <Button variant="action">Upload</Button>
            </UploadExcelFileModal>
          </div>
        </div>
        <div>
          <UiLanguageDataTable />
        </div>
      </div>
    </LanguageDataProvider>
  );
}
