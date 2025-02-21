import { Button } from '@/components/ui/button';
import { DownloadFileListPopoverButton } from '../_components/custom-popover';
import UploadButton from '../_components/upload-button';
import LanguageDataTable from './_components/language-data-table';

export default function UILanguagePage() {
  return (
    <div className="flex flex-col">
      <div className="absolute top-0 right-0 ">
        <DownloadFileListPopoverButton type="template" />
      </div>
      <div className="flex items-center justify-between">
        <span>UI Language List</span>
        <div className="flex gap-3">
          <Button variant="secondary">Download All Data</Button>
          <UploadButton
            title="Upload UI Language"
            buttonText="Upload"
            variant="ui"
          />
        </div>
      </div>

      <LanguageDataTable />
    </div>
  );
}
